#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const figlet = require('figlet')
program
  .version('0.1.0')
  // 定义命令和参数
  .command('create <app-name>')
  // 添加描述
  .description('create a new project')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>')
  .option('-d, --delete <path>', 'delete option from config')
  .action((name, options) => { 
    // 在create.js中执行创建任务
    require('../lib/create')(name, options)
  })

program
  .command('ui')
  .description('start add open yn-cli ui')
  .option('-p, --port <port>', 'Port used for the UI Server')
  .action((option) => {
    console.log(option)
  })


program
// 配置版本号信息
  .version(`v${require('../package.json').version}`)
  .usage('<command> [option]')

  program
  .on('--help', () => {
    // 使用 figlet 绘制 Logo
    console.log('\r\n' + figlet.textSync('xl', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    }));
    // 新增说明信息
    console.log(`\r\nRun ${chalk.cyan(`roc <command> --help`)} show details\r\n`)
  })


//解析用户执行命令传入参数
program.parse(process.argv)