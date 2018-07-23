/**
 * 关键字设置
 */
'use strict';

const Controller = require('egg').Controller;

class KeywordController extends Controller {
  // 获取关键词列表
  async index() {
    const { ctx, service } = this;
    try {
      const rule = {
        type: ['text','image','video','voice','music']
      }
      ctx.validate(rule, ctx.query);
      const page = isNaN(Number(ctx.query.page)) ? 1 : Number(ctx.query.page);
      const pagesize = isNaN(Number(ctx.query.pagesize)) ? 10 : Number(ctx.query.pagesize);
      const keywords = await service.wxKeyword.getKeywords(ctx.query.type,page,pagesize);
      ctx.body = {
        code: 200,
        data: keywords
      };
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

  // 添加关键词
  async create() {
    const { ctx, service } = this;
    try {
      const res = await service.wxKeyword.createKeyword(ctx.request.body);
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

  // 修改关键词
  async update() {
    const { ctx, service } = this;
    try {
      const rule = {
        id: 'id'
      }
      ctx.validate(rule, ctx.params);
      const res = await service.wxKeyword.updateKeyword(ctx.params.id, ctx.request.body);
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

  // 启用/停用关键词
  async edit() {
    const { ctx, service } = this;
    try {
      const rule = {
        id: 'id'
      }
      ctx.validate(rule, ctx.params);
      const res = await service.wxKeyword.updateStatus(ctx.params.id);
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

  // 删除关键词
  async destroy() {
    const { ctx, service } = this;
    try {
      const rule = {
        id: 'id'
      }
      ctx.validate(rule, ctx.params);
      const res = await service.wxKeyword.destroyKeyword(ctx.params.id);
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

  // 特殊消息
  async getSpecial() {
    const { ctx, service } = this;
    try {
      const special = await service.wxKeyword.getSpecial();
      ctx.body = {
        code: 200,
        data: special
      };
    } catch (err) {
      ctx.body = {
        code: 400,
        error: '服务错误'
      };
    }
  }

  // 更新特殊事件
  async updateSpecial() {
    const { ctx, service } = this;
    try {
      const res = await service.wxKeyword.updateSpecial(ctx.request.body);
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

module.exports = KeywordController;