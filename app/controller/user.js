
'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    const { ctx, service } = this;
    try {
      const page = isNaN(Number(ctx.query.page)) ? 1 : Number(ctx.query.page);
      const pagesize = isNaN(Number(ctx.query.pagesize)) ? 10 : Number(ctx.query.pagesize);
      const users = await service.wxUser.getWxUser(page,pagesize);
      ctx.body = {
        code: 200,
        data: users
      };
    } catch (err) {
      ctx.body = {
        code: 400,
        error: '服务错误'
      };
    }
  }
}

module.exports = UserController;