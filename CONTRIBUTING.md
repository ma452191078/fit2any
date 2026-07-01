# 贡献指南

感谢你对 Fit2Any 的关注！欢迎提交 Issue 和 Pull Request。

## 开发环境准备

```bash
git clone https://github.com/ma452191078/fit2any.git
cd fit2any
npm install
npm run dev
```

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建结果 |
| `npm test` | 运行单元测试 |
| `npm test -- --run` | 单次运行测试（CI 模式） |

## 项目架构

Fit2Any 采用**统一中间模型**架构：

```
源文件 (FIT/GPX/TCX)
    ↓ Parser
UnifiedActivity (统一模型)
    ↓ Writer
目标文件 (FIT/GPX/TCX)
```

- `src/core/parsers/` — 格式解析器（源格式 → 统一模型）
- `src/core/generators/` — 格式生成器（统一模型 → 目标格式）
- `src/core/types.ts` — 统一运动数据模型定义
- `src/core/converter.ts` — 转换调度入口
- `src/components/` — Vue 组件
- `tests/` — 单元测试

新增格式只需实现一个 Parser + 一个 Writer，无需改动其他转换逻辑。

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>: <description>

- 变更点 1
- 变更点 2
```

类型：
- `feat` — 新功能
- `fix` — Bug 修复
- `refactor` — 重构
- `docs` — 文档
- `test` — 测试
- `chore` — 构建/工具

## Pull Request 流程

1. Fork 仓库并创建分支：`git checkout -b feat/your-feature`
2. 编写代码，确保通过测试：`npm test`
3. 确保构建通过：`npm run build`
4. 提交并推送：`git push origin feat/your-feature`
5. 创建 Pull Request，描述变更内容

## 代码规范

- 使用 TypeScript，避免 `any`
- 组件使用 Vue 3 `<script setup>` 语法
- 样式使用 CSS 变量（定义在 `src/assets/styles/main.css`）
- 新增功能需配套单元测试

## 报告问题

提交 Issue 时请包含：
- 问题描述
- 复现步骤
- 期望行为 vs 实际行为
- 浏览器和操作系统信息
- （可选）附上导致问题的文件
