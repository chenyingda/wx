
'use strict';

const Controller = require('egg').Controller;

class AuthController extends Controller {
  async login() {
    const { ctx, service } = this;
    try {
      const rule = {
        username: 'string',
        password: 'string'
      }
      ctx.validate(rule, ctx.request.body);
      const res = await service.auth.login(ctx.request.body);
      if (res.status) {
        ctx.body = {
          code: 200,
          data: res.data
        };
      }else{
        ctx.body = {
          code: 400,
          error: res.error
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

  async info() {
    this.ctx.body = {
      code: 200,
      data: {
        username: this.ctx.info.username
      }
    };
  }
}

module.exports = AuthController;