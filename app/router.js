'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index)

  // 登录
  router.post('/login', controller.auth.login);

  const auth = app.middlewares.auth();
  router.get('/user/info', auth, controller.auth.info);
  // 微信配置
  router.resources('/wx/config', auth, controller.config);
  // 自定义菜单
  router.resources('/wx/menus', auth, controller.menu);
  // 关键词
  router.resources('/wx/keywords', auth, controller.keyword);
  // 微信用户
  router.resources('/wx/users', auth, controller.user);
  // 特殊事件
  router.get('/wx/specials', auth, controller.keyword.getSpecial);
  router.post('/wx/specials', auth, controller.keyword.updateSpecial);
  // 上传文件
  // router.post('/upload', auth, controller.common.upload);
  router.post('/upload', controller.common.upload);
  
  // 微信入口
  const wechat = app.middlewares.wechat();


  app.all('/wechat', wechat, 'wechat.index');

  router.post('/qrcode/create', auth, controller.qrcode.create)
  router.post('/qrcode/getallcode', auth, controller.qrcode.getallcode)
  router.post('/qrcode/update/:id', auth, controller.qrcode.update)

  router.post('/click/past/:id', auth, controller.click.past)
  router.post('/click/recommend', auth, controller.click.recommend)

  router.post('/qrcode/codeinfo/:id',auth, controller.qrcode.codeinfo)
  router.post('/recommend/info', auth, controller.qrcode.publicinfo)

  router.post('/unsubs/code/:id', auth, controller.unsubs.code)
  router.post('/unsubs/public', auth, controller.unsubs.public)
};