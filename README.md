# Vue 3 + TypeScript + Vite

# init

```bash
pnpm create vite@latest
```

# commitlint

- @commitlint/cli - commitlint 命令行工具
- @commitlint/config-conventional - Commits 规范
- lefthook - Git 钩子管理器

- .commitlintrc.cjs - commitlint 配置
- lefthook.yml - lefthook 配置

```bash
pnpm add @commitlint/cli @commitlint/config-conventional lefthook --save-dev

# 测试配置是否生效
echo 'feat: 这是一段提交信息' | npx commitlint
```

## oxlint、oxfmt、cspell

- oxlint - 代码质量检查
- oxfmt - 代码风格检查
- cspell - 单词拼写检查

- .oxfmtrc.json - oxfmt 配置
- .oxlintrc.json - oxlint 配置
- cspell.json - cspell 配置

```bash
pnpm add oxlint oxfmt cspell --save-dev

pnpm oxlint --fix # 检查并修复
pnpm oxlint --rules # 列出已注册规则

pnpm oxfmt [--write] # 检查并修复

pnpm cspell lint # 检查
pnpm cspell check [file] # 检查指定文件，输出文件完整内容
```
