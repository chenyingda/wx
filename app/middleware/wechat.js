/**
 * 微信中间件
 * 确认是哪一个微信公众号发送过来的消息
 * 配置该公众号服务器配置
 */
const WXBizMsgCrypt = require('wechat-crypto');

module.exports = options => {
  return async function (ctx, next) {
    // const appid = ctx.params.appid;
    const wx_conf = await ctx.model.WxConfig.findById(1);
    const appid = wx_conf.appid;
    const token = wx_conf.token;
    ctx.wx_token = token
    const encodingAESKey = wx_conf.encodingaeskey;

    ctx.wx_cryptor = new WXBizMsgCrypt(token, encodingAESKey, appid);

    await next();
  };
};