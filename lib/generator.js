const ora = require('ora')
const { getRepoList } = require('./http')
const inquirer = require('inquirer')
const downloadUrl = require('download')
const { getGitlabGroupId } = require('./utils')
// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用ora初始化, 传入提示信息message
  const spinner = ora(message)
  // 开始加载动画
  spinner.start()
  try {
    // 执行传入的方法fn
    const result = await fn(...args)
    // success
    spinner.succeed()
    return result
  } catch {
    // fail
    spinner.fail('Request failed, refetch ...')
  }
}
class Generator{
  constructor(name, targetDir) {
    // 目录名称
    this.name = name
    // 创建位置
    this.targetDir = targetDir
  }
  // 获取模板
  // 1.从远程拉取模板
  // 2.用户根据提示选择模板
  // 3.获取用户选择的模板
  
  // 从某个group下载
  async getRepo() {
    // 获取到的groupId
    const groupId = getGitlabGroupId()
    const responList = await wrapLoading(getRepoList, 'waiting fetch template', groupId)
    if(!responList) return 

    // 修改需要的字段
    const repoItems = responList.map(item => {
      return {
        name: item.name,
        value: item.id
      }
    })

    // 用户选择自己需要的模板
    const { repoId} = await inquirer.prompt({
      name: 'repoId',
      type: 'list',
      choices: repoItems,
      message: 'Please choose a template to create project'
    })

    // 返回项目选择的id
    return repoId
  }

  // 下载远程模板到本地
  /**
   * 下载远程模板到本地
   * @param {Number} repoId 项目/仓库id
   * @param {String} sha SHA值，具体见👇，概括的来说它可以用来下载某次提交，某个tag，某个分支，这里我们作下载分支用
   * @see https://docs.gitlab.com/ee/api/repositories.html#get-file-archive
   */
  async download(repoId, sha) {
    const token = getToken()
    const baseUrl = getGitlabBaseUrl()
    const downloadOptions = {
      extract: true,
      strip: 1,
      mode: '666',
      headers: {
        accept: 'application/zip',
        'PRIVATE-TOKEN': token
      }
    }

    // 拼接下载地址
    let requestUrl = `${baseUrl}/api/v4/projects/${repoId}/repository/archive.zip`
    // 没传shad的话就是下载默认分支

    // 调用下载方法
    await wrapLoading(
      downloadUrl,
      'waiting download template',
      requestUrl,      //下载地址
      this.targetDir,  //创建位置
      downloadOptions  //配置项
    )
  }

  // core => 创建逻辑
  async create() {
    // 1.先拿到项目模板
    const repoId = await this.getRepo()
    // 2.拿到后开始操作~
    if(repoId) {
      // 3.开始下载
      await this.download(repoId)
      // 4.模板使用提示
      console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
      console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
      console.log('  npm run dev\r\n')
    }
  }
}

module.exports = Generator