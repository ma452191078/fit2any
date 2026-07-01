# Fit2Any

> 运动数据文件格式转换工具 · 支持 FIT / GPX / TCX 互转 · 数据本地处理

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Fit2Any 是一个纯前端的运动数据格式转换工具，支持 Garmin FIT、GPX、TCX 三种主流运动数据格式之间的任意互转。所有转换在浏览器本地完成，文件永不上传服务器，最大程度保护隐私。

## ✨ 特性

- **格式互转** — FIT / GPX / TCX 三种格式任意方向互转
- **批量转换** — 支持多文件批量处理，一键打包下载
- **隐私优先** — 所有处理在浏览器本地完成，数据零上传
- **极速转换** — 移动文件秒级完成，无需等待
- **数据无损** — 最大程度保留原始轨迹、心率、配速等数据
- **永久免费** — 开源项目，无广告无注册

## 🚀 在线使用

访问 [Fit2Any 在线版](https://ma452191078.github.io/fit2any/) 即可直接使用，无需安装。

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/ma452191078/fit2any.git
cd fit2any

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 + Vite | 前端框架与构建工具 |
| TypeScript | 类型安全 |
| fit-file-parser | FIT 二进制解析 |
| DOMParser | GPX / TCX XML 解析 |
| JSZip + file-saver | 批量打包下载 |

## 🏗️ 架构设计

采用**统一中间模型**架构，避免两两转换器的组合爆炸：

```
FIT ─┐
GPX ─┼──→ UnifiedActivity（统一模型）──→ FIT / GPX / TCX
TCX ─┘
```

只需 3 个 Parser + 3 个 Writer = 6 个模块，即可实现 6 种转换组合。

## 📁 项目结构

```
src/
├── core/           # 转换引擎（纯逻辑，无 UI 依赖）
│   ├── parsers/    # 格式解析器（FIT/GPX/TCX → 统一模型）
│   ├── generators/ # 格式生成器（统一模型 → FIT/GPX/TCX）
│   ├── types.ts    # 统一运动数据模型
│   └── converter.ts# 转换调度入口
├── components/     # Vue 组件
├── views/          # 页面
└── assets/         # 样式与静态资源
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

[MIT](./LICENSE)
