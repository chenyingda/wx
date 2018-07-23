module.exports = options => {
  return async function (ctx, next) {
    let verify = true;
    verify = await ctx.service.auth.validate(ctx.header['x-token']);
    if (verify) {
        ctx.info = verify;
        await next();
    } else {
        ctx.body = {
            code: 201,
            error: '登录失效'
        }
    }
  };
};