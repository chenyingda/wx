/**
 * co-wechat-api
 */
const Service = require('egg').Service;
const WechatAPI = require('co-wechat-api');

class WechatApiService extends Service {
  async index() {
    const conf = await this.service.wxConfig.getConfig();
    let api = new WechatAPI(conf.appid, conf.appsecret);
    api.setOpts({timeout: 150000});
    return api;
  }
}

module.exports = WechatApiService;