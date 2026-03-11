import Stats from 'stats-gl';
interface MemoryInfo {
  webglMemory: number; // MB，保留2位小数
  jsHeapMemory: number; // MB，保留2位小数
  jsHeapLimit: number; // MB，保留2位小数
  vertexCount: number; // 当前帧顶点数量
  drawCallCount: number; // 当前帧绘制调用次数
}

interface TextureInfo {
  width: number;
  height: number;
  format: number;
  type: number;
  memory: number; // 字节
  timestamp: number;
}

interface BufferInfo {
  size: number; // 字节
  type: number;
  usage: number;
  timestamp: number;
}

interface ProgramInfo {
  vertexShader: string;
  fragmentShader: string;
  timestamp: number;
}

class WebGLMemoryTracker {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private textureMemory: Map<WebGLTexture, TextureInfo> = new Map();
  private bufferMemory: Map<WebGLBuffer, BufferInfo> = new Map();
  private programMemory: Map<WebGLProgram, ProgramInfo> = new Map();
  private isWebGL2: boolean;

  // 当前帧的顶点统计
  private frameDrawCallCount: number = 0;
  private frameTotalVerticesDrawn: number = 0;

  private stats: Stats | null = null;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, stats?: Stats) {
    this.gl = gl;
    this.isWebGL2 = gl instanceof WebGL2RenderingContext;
    this.overrideWebGLMethods();
    this.stats = stats || null;
  }

  /**
   * 重写WebGL方法以自动跟踪资源
   */
  private overrideWebGLMethods(): void {
    const originalCreateTexture = this.gl.createTexture.bind(this.gl);
    const originalDeleteTexture = this.gl.deleteTexture.bind(this.gl);
    const originalTexImage2D = this.gl.texImage2D.bind(this.gl);
    const originalCreateBuffer = this.gl.createBuffer.bind(this.gl);
    const originalDeleteBuffer = this.gl.deleteBuffer.bind(this.gl);
    const originalBufferData = this.gl.bufferData.bind(this.gl);
    const originalCreateProgram = this.gl.createProgram.bind(this.gl);
    const originalDeleteProgram = this.gl.deleteProgram.bind(this.gl);
    const originalAttachShader = this.gl.attachShader.bind(this.gl);
    const originalLinkProgram = this.gl.linkProgram.bind(this.gl);
    const originalDrawArrays = this.gl.drawArrays.bind(this.gl);
    const originalDrawElements = this.gl.drawElements.bind(this.gl);

    // 重写createTexture
    this.gl.createTexture = () => {
      const texture = originalCreateTexture();
      if (texture) {
        this.textureMemory.set(texture, {
          width: 0,
          height: 0,
          format: this.gl.RGBA,
          type: this.gl.UNSIGNED_BYTE,
          memory: 0,
          timestamp: Date.now(),
        });
      }
      return texture;
    };

    // 重写deleteTexture
    this.gl.deleteTexture = (texture: WebGLTexture | null) => {
      if (texture) {
        this.textureMemory.delete(texture);
      }
      originalDeleteTexture(texture);
    };

    // 重写texImage2D以自动更新纹理信息
    this.gl.texImage2D = (target: number, level: number, internalformat: number, ...args: any[]) => {
      // @ts-ignore
      const result = originalTexImage2D.call(this.gl, target, level, internalformat, ...args);
      
      // 获取当前绑定的纹理
      const currentTexture = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);
      if (currentTexture && this.textureMemory.has(currentTexture)) {
        let width: number, height: number, format: number, type: number;
        
        if (args.length >= 5) {
          // texImage2D(target, level, internalformat, width, height, border, format, type, pixels)
          [width, height, , format, type] = args;
        } else if (args.length >= 2) {
          // texImage2D(target, level, internalformat, format, type, source)
          [format, type] = args;
          // 无法直接获取宽高，使用默认值或尝试从图片源获取
          if (args[2] && args[2].width && args[2].height) {
            width = args[2].width;
            height = args[2].height;
          } else {
            width = 512; // 默认值
            height = 512;
          }
        } else {
          width = 512;
          height = 512;
          format = internalformat;
          type = this.gl.UNSIGNED_BYTE;
        }
        
        this.updateTextureInfo(currentTexture, width, height, format, type);
      }
      
      return result;
    };

    // 重写createBuffer
    this.gl.createBuffer = () => {
      const buffer = originalCreateBuffer();
      if (buffer) {
        this.bufferMemory.set(buffer, {
          size: 0,
          type: this.gl.ARRAY_BUFFER,
          usage: this.gl.STATIC_DRAW,
          timestamp: Date.now(),
        });
      }
      return buffer;
    };

    // 重写deleteBuffer
    this.gl.deleteBuffer = (buffer: WebGLBuffer | null) => {
      if (buffer) {
        this.bufferMemory.delete(buffer);
      }
      originalDeleteBuffer(buffer);
    };

    // 重写bufferData以自动更新缓冲区信息
    // @ts-ignore
    this.gl.bufferData = (target: number, data: BufferSource | number, usage: number) => {
      // @ts-ignore
      const result = originalBufferData.call(this.gl, target, data, usage);
      
      // 获取当前绑定的缓冲区
      const currentBuffer = this.gl.getParameter(
        target === this.gl.ARRAY_BUFFER ? this.gl.ARRAY_BUFFER_BINDING : this.gl.ELEMENT_ARRAY_BUFFER_BINDING
      );
      
      if (currentBuffer && this.bufferMemory.has(currentBuffer)) {
        const size = typeof data === 'number' ? data : data.byteLength;
        this.updateBufferInfo(currentBuffer, size, target, usage);
      }
      
      return result;
    };

    // 重写createProgram
    this.gl.createProgram = () => {
      const program = originalCreateProgram();
      if (program) {
        this.programMemory.set(program, {
          vertexShader: '',
          fragmentShader: '',
          timestamp: Date.now(),
        });
      }
      return program;
    };

    // 重写deleteProgram
    this.gl.deleteProgram = (program: WebGLProgram | null) => {
      if (program) {
        this.programMemory.delete(program);
      }
      originalDeleteProgram(program);
    };

    // 重写attachShader来捕获着色器代码
    this.gl.attachShader = (program: WebGLProgram, shader: WebGLShader) => {
      const result = originalAttachShader(program, shader);
      
      // 获取着色器源代码
      const shaderSource = this.gl.getShaderSource(shader);
      const shaderType = this.gl.getShaderParameter(shader, this.gl.SHADER_TYPE);
      
      if (shaderSource && this.programMemory.has(program)) {
        const info = this.programMemory.get(program)!;
        
        if (shaderType === this.gl.VERTEX_SHADER) {
          info.vertexShader = shaderSource;
        } else if (shaderType === this.gl.FRAGMENT_SHADER) {
          info.fragmentShader = shaderSource;
        }
        
        info.timestamp = Date.now();
      }
      
      return result;
    };

    // 重写linkProgram来确保程序信息被更新
    this.gl.linkProgram = (program: WebGLProgram) => {
      const result = originalLinkProgram(program);
      
      // 如果程序链接成功，确保程序信息被正确记录
      if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS) && this.programMemory.has(program)) {
        const info = this.programMemory.get(program)!;
        info.timestamp = Date.now();
      }
      
      return result;
    };

    // 重写drawArrays
    this.gl.drawArrays = (mode: number, first: number, count: number) => {
      if (this.stats) this.stats.begin();
      this.frameDrawCallCount++;
      this.frameTotalVerticesDrawn += count;
      originalDrawArrays(mode, first, count);
      if (this.stats) this.stats.end();
    };

    // 重写drawElements
    this.gl.drawElements = (mode: number, count: number, type: number, offset: number) => {
      if (this.stats) this.stats.begin();
      this.frameDrawCallCount++;
      this.frameTotalVerticesDrawn += count;
      originalDrawElements(mode, count, type, offset);
      if (this.stats) this.stats.end();
    };
  }

  /**
   * 计算纹理内存使用量
   */
  private calculateTextureMemory(width: number, height: number, format: number, type: number): number {
    const bytesPerPixel = this.getBytesPerPixel(format, type);
    let memory = width * height * bytesPerPixel;

    // 考虑mipmap级别
    const maxLevel = Math.floor(Math.log2(Math.max(width, height)));
    for (let i = 1; i <= maxLevel; i++) {
      const mipWidth = Math.max(1, width >> i);
      const mipHeight = Math.max(1, height >> i);
      memory += mipWidth * mipHeight * bytesPerPixel;
    }

    return memory;
  }

  /**
   * 获取每像素字节数
   */
  private getBytesPerPixel(format: number, type: number): number {
    const gl = this.gl;
    
    // 格式映射
    const formatBytes: Record<number, number> = {
      [gl.RGBA]: 4,
      [gl.RGB]: 3,
      [gl.LUMINANCE_ALPHA]: 2,
      [gl.LUMINANCE]: 1,
      [gl.ALPHA]: 1,
      [gl.RGBA4]: 2,
      [gl.RGB565]: 2,
      [gl.RGB5_A1]: 2,
      [gl.DEPTH_COMPONENT]: 1,
      [gl.DEPTH_STENCIL]: 2,
    };

    // WebGL2特定格式
    if (this.isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      formatBytes[gl2.RGBA8] = 4;
      formatBytes[gl2.RGB8] = 3;
    }

    // 类型映射
    const typeBytes: Record<number, number> = {
      [gl.UNSIGNED_BYTE]: 1,
      [gl.BYTE]: 1,
      [gl.UNSIGNED_SHORT]: 2,
      [gl.SHORT]: 2,
      [gl.UNSIGNED_INT]: 4,
      [gl.INT]: 4,
      [gl.FLOAT]: 4,
    };

    // WebGL2特定类型
    if (this.isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      typeBytes[gl2.HALF_FLOAT] = 2;
    }

    const formatByte = formatBytes[format] || 4;
    const typeByte = typeBytes[type] || 1;

    return formatByte * typeByte;
  }

  /**
   * 将字节转换为MB并保留2位小数
   */
  private static bytesToMB(bytes: number): number {
    return parseFloat((bytes / (1024 * 1024)).toFixed(1));
  }

  /**
   * 更新纹理信息
   */
  updateTextureInfo(texture: WebGLTexture, width: number, height: number, format: number, type: number): void {
    const info = this.textureMemory.get(texture);
    if (info) {
      info.width = width;
      info.height = height;
      info.format = format;
      info.type = type;
      info.memory = this.calculateTextureMemory(width, height, format, type);
      info.timestamp = Date.now();
    }
  }

  /**
   * 更新缓冲区信息
   */
  updateBufferInfo(buffer: WebGLBuffer, size: number, type: number, usage: number): void {
    const info = this.bufferMemory.get(buffer);
    if (info) {
      info.size = size;
      info.type = type;
      info.usage = usage;
      info.timestamp = Date.now();
    }
  }

  /**
   * 更新程序信息
   */
  updateProgramInfo(program: WebGLProgram, vertexShader: string, fragmentShader: string): void {
    const info = this.programMemory.get(program);
    if (info) {
      info.vertexShader = vertexShader;
      info.fragmentShader = fragmentShader;
      info.timestamp = Date.now();
    }
  }

  /**
   * 重置当前帧的顶点统计（每帧开始时调用）
   */
  resetFrameStats(): void {
    this.frameDrawCallCount = 0;
    this.frameTotalVerticesDrawn = 0;
  }

  /**
   * 获取WebGL总内存使用量（MB，保留2位小数）
   */
  getWebGLMemory(): number {
    let total = 0;

    // 纹理内存
    let textureMemory = 0;
    for (const info of this.textureMemory.values()) {
      textureMemory += info.memory;
      total += info.memory;
    }

    // 缓冲区内存
    let bufferMemory = 0;
    for (const info of this.bufferMemory.values()) {
      bufferMemory += info.size;
      total += info.size;
    }

    // 程序内存（估算）
    // let programMemory = 0;
    // for (const info of this.programMemory.values()) {
    //   const shaderMemory = (info.vertexShader.length + info.fragmentShader.length) * 2;
    //   programMemory += shaderMemory;
    //   total += shaderMemory;
    // }

    return WebGLMemoryTracker.bytesToMB(total);
  }

  /**
   * 获取JavaScript堆栈内存使用情况（MB，保留2位小数）
   */
  getJSHeapMemory(): {
    used: number;
    limit: number;
    available: boolean;
  } {
    // 检查Performance API是否支持内存信息
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: WebGLMemoryTracker.bytesToMB(memory.usedJSHeapSize || 0),
        limit: WebGLMemoryTracker.bytesToMB(memory.jsHeapSizeLimit || 0),
        available: true,
      };
    }

    return {
      used: 0,
      limit: 0,
      available: false,
    };
  }

  /**
   * 获取当前帧的顶点统计
   */
  getFrameVertexStats(): {
    drawCallCount: number;
    totalVertices: number;
  } {
    return {
      drawCallCount: this.frameDrawCallCount,
      totalVertices: this.frameTotalVerticesDrawn,
    };
  }

  /**
   * 获取完整的内存和顶点信息（实时获取）
   */
  getMemoryInfo(): MemoryInfo {
    const webglMemory = this.getWebGLMemory();
    const jsHeap = this.getJSHeapMemory();
    const vertexStats = this.getFrameVertexStats();

    return {
      webglMemory,
      jsHeapMemory: jsHeap.used,
      jsHeapLimit: jsHeap.limit,
      vertexCount: vertexStats.totalVertices,
      drawCallCount: vertexStats.drawCallCount,
    };
  }

  /**
   * 获取详细的资源统计（用于调试）
   */
  getDetailedStats(): {
    textures: { count: number; totalMemory: number };
    buffers: { count: number; totalMemory: number };
    programs: { count: number; totalMemory: number };
  } {
    const textureMemory = Array.from(this.textureMemory.values()).reduce((sum, info) => sum + info.memory, 0);
    const bufferMemory = Array.from(this.bufferMemory.values()).reduce((sum, info) => sum + info.size, 0);
    const programMemory = Array.from(this.programMemory.values()).reduce((sum, info) => 
      sum + (info.vertexShader.length + info.fragmentShader.length) * 2, 0);

    return {
      textures: {
        count: this.textureMemory.size,
        totalMemory: WebGLMemoryTracker.bytesToMB(textureMemory),
      },
      buffers: {
        count: this.bufferMemory.size,
        totalMemory: WebGLMemoryTracker.bytesToMB(bufferMemory),
      },
      programs: {
        count: this.programMemory.size,
        totalMemory: WebGLMemoryTracker.bytesToMB(programMemory),
      },
    };
  }

  /**
   * 清理所有资源
   */
  clear(): void {
    this.textureMemory.clear();
    this.bufferMemory.clear();
    this.programMemory.clear();
    this.frameDrawCallCount = 0;
    this.frameTotalVerticesDrawn = 0;
  }
}

export default WebGLMemoryTracker;
export type { MemoryInfo };
