/**
 * 自定义菜单
 */
'use strict';

const Controller = require('egg').Controller;

class MenuController extends Controller {
  // 获取自定义菜单
  async index() {
    const { ctx, service } = this;
    const menus = await service.wxMenu.getMenus();
    ctx.body = {
      code: 200,
      data: menus
    };
  }

  // 保存并发布自定义菜单
  async create() {
    const { ctx, service } = this;
    const res = await service.wxMenu.createMenu(ctx.request.body.menus);
    if (res.status) {
      ctx.body = {
        code: 200
      };
    }else{
      ctx.body = {
        code: 400,
        error: res.error
      };
    }
  }
}

module.exports = MenuController;