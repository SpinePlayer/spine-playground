export const vs = `
attribute vec4 \${Shader.POSITION};
attribute vec4 \${Shader.COLOR};
attribute vec4 \${Shader.COLOR2};
attribute vec2 \${Shader.TEXCOORDS};
uniform mat4 \${Shader.MVP_MATRIX};
varying vec4 v_light;
varying vec4 v_dark;
varying vec2 v_texCoords;

void main () {
	v_light = \${Shader.COLOR};
	v_dark = \${Shader.COLOR2};
	v_texCoords = \${Shader.TEXCOORDS};
	gl_Position = \${Shader.MVP_MATRIX} * \${Shader.POSITION};
}
`;

export const fs = `
precision mediump float;
varying vec4 v_light;
varying vec4 v_dark;
varying vec2 v_texCoords;
uniform sampler2D u_texture;

void main() {
    vec4 texColor = texture2D(u_texture, v_texCoords);
    vec4 color = texColor * v_light;
    
    // 红色滤镜效果：增强红色通道，减弱绿色和蓝色通道
    color.r = min(color.r * 1.5, 1.0);  // 增强红色
    color.g = color.g * 0.3;            // 减弱绿色
    color.b = color.b * 0.3;            // 减弱蓝色
    
    gl_FragColor = color;
}
`;