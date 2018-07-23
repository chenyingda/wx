const Service = require('egg').Service;
const crypto = require('crypto');
const ADMIN_CACHE_PREFIX = 'admin-';
const EXPIRE_TIME = 3600 * 24 * 7;

class AuthService extends Service {
  async  login(loginData) {
    const { app, ctx } = this;
    const { WxAdmin } = ctx.model;

    let adminInfo = await WxAdmin.findOne({
      where: {username: loginData.username}
    });

    const md5 = crypto.createHash('md5');
    const password = md5.update(loginData.password).digest('hex');
    // 第一次添加管理员
    if (loginData.username == 'admin' && !adminInfo) {
      adminInfo = await WxAdmin.create({
        username: loginData.username,
        password: password,
        create_time: Math.floor(Date.now() / 1000)
      });
    }
    
    if (!adminInfo || loginData.password == undefined || password != adminInfo.password) {
      return {
        status: false,
        error: '账号或密码错误'
      };
    }

    const baseInfo = {
      username: adminInfo.username,
      id: adminInfo.id
    };

    app.redis.set(ADMIN_CACHE_PREFIX + baseInfo.id, JSON.stringify(baseInfo), 'EX', EXPIRE_TIME);

    const token = app.jwt.sign(baseInfo, app.config.keys);

    return {
      status: true,
      data: {
        token: token
      }
    };
  }

  async validate(token) {
    const { app } = this;
    const decoded = await this.verifyToken(token);
    
    if (!decoded) {
      return false;
    }

    const info = await app.redis.get(ADMIN_CACHE_PREFIX + decoded.id);
    if (!info) {
      return false; 
    } else {
      return JSON.parse(info);
    }
  }

  /**
   * 验证登录凭证是否有效
   * @param {string} token 登录凭证 
   */
  async verifyToken(token) {
    try {
      const { app } = this;
      const decoded = app.jwt.decode(token, app.config.keys);
      return decoded;
    } catch (err) {
      return false;
    }
  }
}

module.exports = AuthService;