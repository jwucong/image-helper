module.exports = {
  // 每行最大字符数
  printWidth: 80,
  // tab缩进
  tabWidth: 2,
  // 使用tab替换space
  useTabs: true,
  // 句末加分号
  semi: true,
  // 使用单引号
  singleQuote: true,
  // 引号包裹对象属性：<as-needed|consistent|preserve>
  quoteProps: 'as-needed',
  // 在JSX中使用单引号而不是双引号
  jsxSingleQuote: true,
  // 在多行数组的最后一项后面加逗号：<none|es5|all>
  trailingComma: 'none',
  // 从对象解构赋值给变量时，大括号两端使用空格
  // true: const { id, name } = object
  // false: const {id, name} = object
  bracketSpacing: true,
  // jsx标签使用多行属性时，">"符号跟在最后一行，而不是独占一行
  jsxBracketSameLine: true,
  // 箭头函数只有一个参数时是否需要括号：<avoid|always>
  // avoid: const p = x => x * x
  // always: const p = (x) => x * x
  arrowParens: 'avoid',
  // endOfLine: <auto|lf|crlf|cr>
  endOfLine: 'auto'
}
