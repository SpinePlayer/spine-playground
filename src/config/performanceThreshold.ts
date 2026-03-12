export interface PerformanceThreshold {
  name: string;
  type: 'min' | 'max';
  const: number;
  unit: string;
}

export default {
  fps: {
    name: 'FPS',
    type: 'min',
    threshold: 30,
    unit: '',
    desc: '全局',
    advice: '建议优化长任务'
  },
  drawCalls: {
    name: 'DrawCalls',
    type: 'max',
    threshold: 100,
    unit: '',
    desc: '全局',
    advice: '建议减少纹理图数量或blendMode复杂度'
  },
  vertices: {
    name: '顶点数量',
    type: 'max',
    threshold: 5000,
    unit: '',
    desc: '全局',
    advice: '建议减少顶点数量'
  },
  WebGLMemory: {
    name: '纹理内存',
    type: 'max',
    threshold: 100,
    unit: 'MB',
    desc: '全局',
    advice: '建议减少纹理图片，或及时移除不需要的纹理图'
  },
  bonesCount: {
    name: '骨骼数量',
    type: 'max',
    threshold: 200,
    unit: '',
    desc: '当前spine',
    advice: '建议减少骨骼数量'
  },
  skeletonDataSize: {
    name: '资源对象内存',
    type: 'max',
    threshold: 15,
    unit: 'MB',
    desc: '当前spine',
    advice: '建议减少资源内存占用'
  },
  boundWidth: {
    name: '边界宽度',
    type: 'max',
    threshold: window.innerWidth * 2,
    unit: 'px',
    desc: '当前spine',
    advice: '建议尺寸小于等于屏幕二倍'
  },
};
