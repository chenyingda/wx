const Service = require('egg').Service;
class WxUserService extends Service {
  async saveUser(message,type) {
    let openid=message.FromUserName
    const { ctx, service } = this;
    const { WxUser } = ctx.model;
    try{
      const userInfo = await WxUser.findOne({
        where: {
          openid: openid
        }
      });
      let updateWxUser = {};
      let createWxUser = {};
      let createrecord={}
      if (type == 'subscribe') {
        const api = await service.wechatApi.index();
        const wxUserInfo = await api.getUser(openid);
        if (wxUserInfo) {
          if (userInfo) {
            const userid=userInfo.id
            if(message.EventKey&&message.EventKey!=''){
              const EventKey=message.EventKey
              let str=EventKey.slice(8)
              const code=await ctx.service.wxcode.findcodebyid(str)
              if(code){
                const code_id=code.id
                if(code_id!=userInfo.code_id){
                  wxUserInfo.code_id=code_id
                  wxUserInfo.unsubscribe_time=null  
                  wxUserInfo.subscribe_time=Math.floor(Date.now()/1000)
                  console.log('wxUserInfo',wxUserInfo)
                  await userInfo.update(wxUserInfo);
                }else{
                  const updates={
                    "subscribe":1,
                    "subscribe_time":Math.floor(Date.now()/1000)
                  }
                  await userInfo.update(updates)
                }
                console.log('7777777')
                const recordtime=Math.floor(Date.now()/1000)
                createrecord={
                  userid:userid,
                  codeid:code_id,
                  subscribe_time:recordtime,
                  recordtime:recordtime,
                  subscribe:1
                }
                await ctx.service.wxuserrecord.create(createrecord)
              }else{
                const updates={
                  'subscribe':1,
                  'code_id':null,
                  'subscribe_time':Math.floor(Date.now()/1000)
                }
                await userInfo.update(updates)
              }
            }else{
                const updates={
                  'subscribe':1,
                  'code_id':null,
                  'subscribe_time':Math.floor(Date.now()/1000)
                }
                await userInfo.update(updates)  
            }
          } else {
            console.log('222222222222')
            if(message.EventKey&&message.EventKey!=''){
              const EventKey=message.EventKey
              let str=EventKey.slice(8)
              console.log('this is str', str)
              const code=await ctx.service.wxcode.findcodebyid(str)
              if(code){
                const code_id=code.id
                wxUserInfo.code_id=code_id
                const user=await WxUser.create(wxUserInfo);
                const userid=user.id
                const recordtime=Math.floor(Date.now()/1000)
                createrecord={
                  userid:userid,
                  codeid:code_id,
                  subscribe_time:recordtime,
                  recordtime:recordtime,
                  subscribe:1
                }
                await ctx.service.wxuserrecord.create(createrecord)
              }else{
                await WxUser.create(wxUserInfo)
              }
            }else{
              await WxUser.create(wxUserInfo);
            }
          }
        }
      } else {
        if (userInfo) {
          const userid=userInfo.id
          if(userInfo.code_id!=null){
              const recordtime=Math.floor(Date.now()/1000)
              createrecord={
                unsubscribe_time:recordtime,
                subscribe:0,
                userid:userid,
                codeid:userInfo.code_id,
                recordtime:recordtime
              }
              await ctx.service.wxuserrecord.create(createrecord)
          }
          if(userInfo.unsubscribe_time!=null){
            updateWxUser={
              subscribe: 0,
            }
          }else{
            updateWxUser = {
              subscribe: 0,
              unsubscribe_time: Math.floor(Date.now()/1000),
            };
          }
          await userInfo.update(updateWxUser);
        } else {
          createWxUser = {
            openid: openid,
            subscribe: 0,
            unsubscribe_time: Math.floor(Date.now() / 1000),
          };
          await WxUser.create(createWxUser);
        }
      }
    } catch (err) {
      console.log('err：',err);
      return {
        status: false,
        error: '服务错误'
      };
    }
  }

  async getWxUser(page,pagesize) {
    const { ctx } = this;
    const { WxUser } = ctx.model;
    return await WxUser.findAndCountAll({
      order: [['id','DESC']],
      offset: (page - 1) * pagesize,
      limit: pagesize
    });
  }

  async finduserbyid(id){
    const {ctx}=this
    const {WxUser}=ctx.model
    const user=await WxUser.findOne({where:{'id':id}})
    return user
  }
}
module.exports = WxUserService;