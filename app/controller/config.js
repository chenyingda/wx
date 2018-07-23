/**
 * 微信配置
 */
'use strict';

const Controller = require('egg').Controller;

class ConfigController extends Controller {
  // 获取微信配置信息
  async index() {
    const { ctx, service } = this;
    let conf = await service.wxConfig.getConfig();
    conf.dataValues.url = "http://" + ctx.host + "/wechat";
    ctx.body = {
      code: 200,
      data: conf
    };
  }

  // 更新微信配置信息
  async create() {
    const { ctx, service } = this;
    try {
      const rule = {
        appid: 'string',
        appsecret: 'string',
        token: 'string',
        encodingaeskey: 'string'
      }
      ctx.validate(rule, ctx.request.body);
      const res = await service.wxConfig.updateConfig(ctx.request.body);
      if (res) {
        ctx.body = {
          code: 200
        };
      }else{
        ctx.body = {
          code: 400,
          error: '更新失败'
        };
      }
    } catch (err) {
      console.log('err：',err);
      if (err.code == 'invalid_param') {
        ctx.body = {
          code: 422,
          error: '参数错误'
        };
      } else {
        ctx.body = {
          code: 400,
          error: '服务错误'
        };
      }
    }
  }
}

module.exports = ConfigController;