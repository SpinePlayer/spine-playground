// 单动画播放默认资源
export const DEFAULT_ASSETS = {
  atlas:
    'https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy-pma.atlas',
  skel: 'https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy-pro.json',
};

// 多动画播放默认资源
export const DEFAULT_MULTI_ASSETS = [
  {
    atlas:
      'https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy-pma.atlas',
    skel: 'https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy-pro.json',
    bound: {
      x: 0,
      y: 100,
      width: 300,
      height: 300,
    },
    uuid: 'spineboy',
  },
  {
    atlas:
      'https://zh.esotericsoftware.com/files/examples/4.2/raptor/export/raptor-pma.atlas',
    skel: 'https://zh.esotericsoftware.com/files/examples/4.2/raptor/export/raptor-pro.json',
    bound: {
      x: 220,
      y: 100,
      width: 300,
      height: 300,
    },
    uuid: 'raptor',
  },
];

// 手机预览URL
export const MOBILE_URL =
  'https://spineplayer.github.io/spine-playground/mobile/index.html';

// API文档URL
export const API_DOCS_URL = 'https://spineplayer.github.io/spine-player-docs/';
