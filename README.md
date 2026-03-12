# Spine Playground

一个基于 Vue 3 + TypeScript + Vite 的 Spine 动画播放器 playground 项目。

## 相关链接

- **[演示地址](https://spineplayer.github.io/spine-playground/)** - 在线体验 Spine Playground
- **[API 文档](https://spineplayer.github.io/spine-player-docs/)** - spine-web-player API 文档
- **[Player 仓库](https://github.com/SpinePlayer/spine-player)** - spine-web-player 代码仓库

## 功能特性

- 🎬 **单动画播放** - 播放单个 Spine 动画文件
- 🎭 **Vue组件式播放** - 使用 Vue 组件的方式管理和播放动画
- 🎪 **多动画播放管理** - 管理和控制多个 Spine 动画的播放状态
- 📚 **API文档链接** - 快速访问 Spine API 文档
- 🎨 **简洁时尚的UI** - 现代化的用户界面设计

## 技术栈

- **Vue 3** - 最新版本的 Vue.js 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **Vue Router** - 客户端路由管理

## 项目结构

```
spine-playground/
├── src/
│   ├── views/                 # 页面组件
│   │   ├── SingleAnimation.vue    # 单动画播放页面
│   │   ├── ComponentAnimation.vue # Vue组件式播放页面
│   │   └── MultiAnimation.vue     # 多动画播放管理页面
│   ├── router/               # 路由配置
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 应用入口
│   └── style.css            # 全局样式
├── index.html               # HTML 模板
├── package.json             # 项目配置
├── vite.config.ts           # Vite 配置
└── tsconfig.json            # TypeScript 配置
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

### 预览生产版本

```bash
pnpm run preview
```

## 页面说明

### 单动画播放
- 支持选择 Spine 动画文件（.json, .atlas）
- 提供播放、暂停、停止控制
- 动画列表选择功能

### Vue组件式播放
- 组件化的动画管理
- 支持添加/移除动画组件
- 全局配置选项（自动播放、循环、速度等）
- 组件状态管理

### 多动画播放管理
- 全局控制（播放全部、暂停全部、停止全部）
- 播放模式选择（顺序、并行、随机）
- 时间轴显示
- 动画列表管理
- 预览区域

## 开发说明

目前项目只实现了框架和UI界面，具体的 Spine 动画播放功能需要后续集成 Spine 运行时库来实现。

## 许可证

MIT License
