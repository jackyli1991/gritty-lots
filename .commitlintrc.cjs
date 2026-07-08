module.exports = {
  extends: ['@commitlint/config-conventional'], // 遵循 Conventional Commits 规范
  rules: {
    // 规则名称: [校验级别：0(禁用)、1(警告)、2(错误), 应用时机：always(总是触发)、never(从不触发触发), 规则值]
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'ci', 'revert', 'build', 'perf']], // 限制 type 为指定值
  }
}