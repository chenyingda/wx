/**
 * 微信配置文件
 */
const Service = require('egg').Service;

class WxConfigService extends Service {
  // 获取微信配置
  async getConfig() {
    const { ctx } = this;
    let conf = await ctx.model.WxConfig.findOne({
      where: {
        id: 1
      },
      attributes: ['appid','appsecret','token','encodingaeskey']
    });
    return conf;
  }

  // 更新微信配置
  async updateConfig(config) {
    const { ctx } = this;
    const conf = await ctx.model.WxConfig.findById(1);
    return await conf.update(config);
  }
}

module.exports = WxConfigService;