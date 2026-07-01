# Fit2Any

> 运动数据文件格式转换工具 · 支持 FIT / GPX / TCX 互转 · 数据本地处理

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/ma452191078/fit2any/actions/workflows/ci.yml/badge.svg)](https://github.com/ma452191078/fit2any/actions/workflows/ci.yml)

Fit2Any 是一个纯前端的运动数据格式转换工具，支持 Garmin FIT、GPX、TCX 三种主流运动数据格式之间的任意互转。所有转换在浏览器本地完成，文件永不上传服务器，最大程度保护隐私。

## ✨ 特性

- **格式互转** — FIT / GPX / TCX 三种格式任意方向互转（6 种组合）
- **批量转换** — 支持多文件批量处理，一键打包下载 ZIP
- **隐私优先** — 所有处理在浏览器本地完成，数据零上传
- **极速转换** — 大文件秒级完成，无需等待
- **数据无损** — 最大程度保留轨迹、心率、配速、圈数等数据
- **离线可用** — PWA 支持，安装后可离线使用
- **永久免费** — 开源项目，MIT 协议，无广告无注册

## 🚀 在线使用

访问 **[Fit2Any 在线版](https://ma452191078.github.io/fit2any/)** 即可直接使用，无需安装。

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

# 运行测试
npm test
```

## 📦 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 + Vite | 前端框架与构建工具 |
| TypeScript | 类型安全 |
| fit-file-parser | FIT 二进制解析 |
| DOMParser | GPX / TCX XML 解析 |
| JSZip + file-saver | 批量打包下载 |
| vite-plugin-pwa | 离线可用 |
| Vitest | 单元测试 |

## 🏗️ 架构设计

采用**统一中间模型**架构，避免两两转换器的组合爆炸：

```
FIT ─┐
GPX ─┼──→ UnifiedActivity（统一模型）──→ FIT / GPX / TCX
TCX ─┘
```

只需 3 个 Parser + 3 个 Writer = 6 个模块，即可实现 6 种转换组合。新增格式只需实现一对 Parser + Writer。

### 格式能力对照

| 字段 | FIT | GPX | TCX |
|------|:---:|:---:|:---:|
| 轨迹点（经纬度+时间） | ✅ | ✅ | ✅ |
| 海拔 | ✅ | ✅ | ✅ |
| 心率 | ✅ | ⚠️ 扩展 | ✅ |
| 步频/踏频 | ✅ | ⚠️ 扩展 | ✅ |
| 功率 | ✅ | ❌ | ✅ |
| 速度 | ✅ | ❌ | ✅ |
| 圈数（Lap） | ✅ | ❌ | ✅ |
| 运动类型 | ✅ | ⚠️ 推断 | ✅ |

> ⚠️ GPX 标准不包含训练数据，Fit2Any 通过 gpxtpx 扩展写入心率/步频。从 GPX 转出时这些字段无法凭空生成。

## 📁 项目结构

```
src/
├── core/               # 转换引擎（纯逻辑，无 UI 依赖）
│   ├── parsers/        # 格式解析器（FIT/GPX/TCX → 统一模型）
│   ├── generators/     # 格式生成器（统一模型 → FIT/GPX/TCX）
│   ├── fit-encoder.ts  # FIT 二进制编码器（自研）
│   ├── types.ts        # 统一运动数据模型
│   └── converter.ts    # 转换调度入口
├── components/         # Vue 组件
│   ├── ConverterCard.vue  # 转换器卡片（单文件模式）
│   └── BatchMode.vue      # 批量转换模式
├── composables/        # 组合式函数
├── views/              # 页面
└── assets/             # 样式与静态资源

tests/                  # 单元测试（Vitest）
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！请阅读 [贡献指南](./CONTRIBUTING.md)。

## 📄 License

[MIT](./LICENSE)
