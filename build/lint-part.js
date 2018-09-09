const path = require('path')
const standard = require('standard')

const dirRoot = path.resolve(__dirname, '..')

// 在这里添加改完的文件，支持 glob，例如 dist/**/*.js 表示dist目录及其子目录下所有以js为后缀的文件
const files = [
  '*.js',
  'src/**/*.js'
]

var opts = {
  ignore: [
    'dist/**/*.js',
  ], // glob 形式的排除列表 (一般无须配置)
  cwd: dirRoot, // 当前工作目录（默认为：process.cwd()）
  fix: false, // 是否自动修复问题
  globals: [], // 声明需要跳过检测的定义全局变量
  plugins: [], // eslint 插件列表
  envs: [], // eslint 环境
  parser: '' // js 解析器（例如 babel-eslint）
}

standard.lintFiles(files, opts, (error, results) => {
  if (error) {
    return process.exit(1)
  }
  for (const item of results.results) {
    for (const msg of item.messages) {
      console.log(`${item.filePath}:${msg.line}:${msg.column} ${msg.message}`)
    }
  }
  console.log(`error: ${results.errorCount}\nwarning: ${results.warningCount}`)
  if (results.errorCount > 0 || results.warningCount > 0) {
    process.exit(2)
  }
})
