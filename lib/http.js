const axios = require('axios')
const { getGitlabBaseUrl, getToken } = require('./utils')

// 去gitlab下载模板
const service = axios.create({
  withCredentials: true,  //跨域
  timeout: 15000
})

service.interceptors.request.use(
  config => {
    //get =>  gitlab_baseUrl
    const baseUrl = getGitlabBaseUrl
    console.log("#####baseUrl", baseUrl)
    // 放着真正请求才会报错
    config.baseUrl = `${baseUrl}/xxxx`
    config.headers[Token] = getToken()

    return config
  }
)

service.interceptors.response.use(res => {
  return res.data
})

/**
 * 获取gitlab某个组下的所有仓库列表
 * @param {Number}} groupId 组id 会通过配置文件取这个id
 * @see api 👉 https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects
 */

async function getRepoList (groupId) {
  return service.get(`/groups/${groupId}/projects`)
}

// /**
//  * 获取gitlab某个项目的所有分支
//  * @param {Number | String} repoId 仓库/项目id
//  * @see api 👉 https://docs.gitlab.com/ee/api/branches.html#list-repository-branches
//  */
// export function getRepoList (repoId) {
//   return service.get(`/projects/${repoId}/repository/branches`)
// }

module.exports = {
  getRepoList,
}