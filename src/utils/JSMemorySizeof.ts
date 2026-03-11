export default class JSMemorySizeof {
  static bytesToMB(bytes: number): number {
    return parseFloat((bytes / (1024 * 1024)).toFixed(1));
  }

  static roughSizeOfObject(
    object: any,
    options?: {
      maxNodes?: number;
      maxSize?: number; // 最大计算大小（字节）
      timeout?: number; // 超时时间（毫秒）
    }
  ) {
    const maxNodes = options?.maxNodes ?? 1000000; // 默认最多处理 100 万个节点
    const maxSize = options?.maxSize ?? 200 * 1024 * 1024; // 默认最大 200MB
    const timeout = options?.timeout ?? 5000; // 默认 5 秒超时

    const objectSet = new Set(); // 使用 Set 提高循环引用检查性能
    const stack = [object];
    let bytes = 0;
    let nodeCount = 0;
    const startTime = Date.now();

    try {
      while (stack.length > 0) {
        // 检查节点数限制
        if (nodeCount >= maxNodes) {
          console.warn(`roughSizeOfObject: 达到最大节点数限制 (${maxNodes})`);
          break;
        }

        // 检查超时
        if (Date.now() - startTime > timeout) {
          console.warn(`roughSizeOfObject: 计算超时 (${timeout}ms)`);
          break;
        }

        // 检查大小限制
        if (bytes >= maxSize) {
          console.warn(
            `roughSizeOfObject: 达到最大大小限制 (${JSMemorySizeof.bytesToMB(maxSize)}MB)`
          );
          break;
        }

        const value = stack.pop();
        nodeCount++;

        if (typeof value === 'boolean') {
          bytes += 4;
        } else if (typeof value === 'string') {
          bytes += value.length * 2;
        } else if (typeof value === 'number') {
          bytes += 8;
        } else if (typeof value === 'symbol') {
          bytes += 8; // 处理 symbol 类型
        } else if (typeof value === 'object' && value !== null) {
          // 避免循环引用，使用 Set 性能更好
          if (!objectSet.has(value)) {
            objectSet.add(value);

            // 处理数组
            if (Array.isArray(value)) {
              for (let i = 0; i < value.length; i++) {
                stack.push(value[i]);
              }
            } else {
              // 处理普通对象
              for (const prop in value) {
                if (Object.prototype.hasOwnProperty.call(value, prop)) {
                  bytes += prop.length * 2; // 属性名占用内存
                  stack.push(value[prop]);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('roughSizeOfObject: 计算过程中发生错误', error);
      return -1; // 返回 -1 表示计算失败
    }

    return JSMemorySizeof.bytesToMB(bytes);
  }
}
