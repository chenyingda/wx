/**
 * 微信服务器配置入口
 */
'use strict';

const wechat = require('co-wechat');

module.exports = app => {
  class WechatController extends app.Controller {

  }
  
  WechatController.prototype.index = wechat({
    // 当有前置中间件设置 ctx.wx_token 和 ctx.wx_cryptor 时，这里配置随意填写
    token: 'cyd',
    appid: 'wx0d07c4c482d2194b',
    encodingAESKey: ''
  }).middleware(async (message, ctx) => {
    // 接收微信消息进行处理
    return await ctx.service.wechat.index(message);
  });

  return WechatController;
};