/**
 * 微信自定义回复
 */
const Service = require('egg').Service;

let id;// 微信公众号服务器配置id

class WechatService extends Service {
  async index(message) {
    console.log('-------message-----',message);
    // id = this.ctx.params.id;
    let { MsgType, Event, EventKey, Ticket, Content } = message;
    if (MsgType == 'event') {
      // 接收事件推送
      switch (Event.toLowerCase()) {
        case 'subscribe':// 关注
          await this.service.wxUser.saveUser(message,'subscribe');
          return await this.special('subscribe', message);
          if (Ticket) {
            // 扫描带参数二维码事件--用户未关注时，进行关注后的事件推送
          } else {
            // 关注事件
          }
          break;
        case 'unsubscribe':// 取消关注事件--无需处理
          await this.service.wxUser.saveUser(message,'unsubscribe');
          break;
        case 'scan':// 扫描带参数二维码事件--用户已关注时的事件推送
          break;
        case 'location':// 上报地理位置事件
          return await this.special('event_location', message);
          break;
        case 'click':// 自定义菜单事件--点击菜单拉取消息时的事件推送
          return await this.keyword(EventKey, message);
          break;
        case 'view':// 自定义菜单事件--点击菜单跳转链接时的事件推送--无需处理
          return await this.special('view', message);
          break;
      }
    } else {
      // 接收普通消息
      switch (MsgType) {
        case 'text':// 文本消息
          return await this.keyword(Content, message);
          break;
        case 'image':// 图片消息
        case 'voice':// 语音消息
        case 'video':// 视频消息
        case 'shortvideo':// 小视频消息
        case 'location':// 地理位置消息
        case 'link':// 链接消息
          return await this.special('reply', message);
          break;
      }
    }
    return '';
  }

  /**
   * 关键词回复规则
   * @param keyword 消息文本
   * @param msg array 微信消息
   * case 回复类型 text,addon,images,news,voice,music,video
   */
    async keyword(keyword, msg){
    console.log("keyword", keyword)
    const rule = await this.app.model.WxRule.findOne({
      where: {
        keyword: keyword,
        status: 1,
        event: null
      }
    });
    // console.log("rule.reply_id", rule.reply_id);
    if (rule) {
      let reply_list;
      if(rule.type == 'news' && rule.reply_id.indexOf(",")>= 0){
        const replies_id = rule.reply_id.split(",");
        console.log("replies_id", replies_id);
        reply_list = [];
        for(let reply_id of replies_id){
          const reply = await this.app.model.WxReply.findOne({
            where: {
              reply_id: reply_id
            }
          });
          reply_list.push(reply);
        }
      }else{ 
        reply_list = await this.app.model.WxReply.findAll({
          where: {
            reply_id: rule.reply_id
          }
        });
      }
      if (reply_list) {
        switch (rule.type) {
          case 'text'://文本
            return {
              type: "text", 
              content: reply_list[0].content
            };
            break;
          case 'image'://图片
            return {
              type: "image",
              content: {
                mediaId: reply_list[0].media_id
              }
            };
            break;
          case 'voice'://语音
            return {
              type: "voice",
              content: {
                mediaId: reply_list[0].media_id
              }
            };
            break;
          case 'video'://视频
            return {
              type: "video",
              content: {
                mediaId: reply_list[0].media_id,
                title: reply_list[0].title,
                description: reply_list[0].content
              }
            };
            break;
          case 'music'://音乐
            return {
              title: reply_list[0].title,
              description: reply_list[0].content,
              musicUrl: reply_list[0].url,
              hqMusicUrl: reply_list[0].link
            };
            break;
          case 'news'://图文回复
            let news = [];
            /*const api = await this.ctx.service.wechatApi.index();
            const material = await api.getMaterial(reply_list[0].media_id);*///获取永久素材
            for (var i = 0; i < reply_list.length; i++) {
/*              const news_info = JSON.parse(material);
              console.log("material", typeof(news_info));
              console.log("material", news_info.news_item[i]);*/
              let new_ = {
                title: reply_list[i].title,
                description: reply_list[i].content,
                picurl: reply_list[i].url.indexOf('http')>=0?reply_list[i].url.url:"http://" + this.ctx.host + reply_list[i].url,
                url: reply_list[i].link
              };
              news.push(new_);
            }
            console.log("news", news);
            return news;
            break;
        }
      }
      // 转发到客服接口
      // return {
      //   type: "customerService",
      //   kfAccount: "test1@test" //可选
      // };
      return '';
    }else{
      return await this.special('reply', msg);
    }
    return '';
  }
  /**
   * 处理特殊事件
   * type 事件类型
   * $msgData 微信服务器发来消息
   */
  async special(type, msg) {
    const rule = await this.app.model.WxRule.findOne({
      where: {
        event: type,
        status: 1
      }
    });
    if (rule) {
      if (rule.keyword) {
        return await this.keyword(rule.keyword,msg);
      }
    }
    return '';
  }
}

module.exports = WechatService;