/**
 * 关键字
 */
const Service = require('egg').Service;
const path = require('path');

class WxKeywordService extends Service {
  // 获取关键词列表
  async getKeywords(type,page,pagesize) {
    const { ctx } = this;
    const { WxRule, WxReply } = ctx.model;
    const keywords = await WxRule.findAndCountAll({
      where: {
        type: type
      },
      include: [{
        model: WxReply,
        as: "ruleReply"
      }],
      order: [['id','DESC']],
      offset: (page - 1) * pagesize,
      limit: pagesize
    });
    //-------------------组装返回数据----------------
    let result = [];
    for (var i = 0; i < keywords.rows.length; i++) {
      let row = keywords.rows[i];
      let pushData = {
        id: row.id,
        keyword: row.keyword,
        status: row.status
      };
      switch (type) {
        case 'text':
          pushData.content = row.ruleReply.content;
          break;
        case 'image':
          pushData.url = row.ruleReply.url
          pushData.showUrl = row.ruleReply.url.indexOf('http')>=0?row.ruleReply.url:"http://" + ctx.host + row.ruleReply.url;
          pushData.status_type = row.ruleReply.status_type;
          pushData.media_id = row.ruleReply.media_id;
          break;
        case 'video':
          pushData.title = row.ruleReply.title;
          pushData.content = row.ruleReply.content;
          pushData.url = row.ruleReply.url
          pushData.showUrl = row.ruleReply.url.indexOf('http')>=0?row.ruleReply.url:"http://" + ctx.host + row.ruleReply.url;
          pushData.status_type = row.ruleReply.status_type;
          pushData.media_id = row.ruleReply.media_id;
          break;
        case 'voice':
          pushData.title = row.ruleReply.title;
          pushData.url = row.ruleReply.url
          pushData.showUrl = row.ruleReply.url.indexOf('http')>=0?row.ruleReply.url:"http://" + ctx.host + row.ruleReply.url;
          pushData.status_type = row.ruleReply.status_type;
          pushData.media_id = row.ruleReply.media_id;
          break;
        case 'music':
          pushData.title = row.ruleReply.title;
          pushData.content = row.ruleReply.content;
          pushData.url = row.ruleReply.url
          pushData.showUrl = row.ruleReply.url.indexOf('http')>=0?row.ruleReply.url:"http://" + ctx.host + row.ruleReply.url;
          pushData.link = row.ruleReply.link;
          break;
      }
      result.push(pushData);
    }
    //-------------------组装返回数据----------------
    return {
      count: keywords.count,
      rows: result
    };
  }

  // 创建关键词
  async createKeyword(keywordData) {
    const { ctx, service } = this;
    const { WxRule, WxReply } = ctx.model;
    // 数据验证
    let rule = {
      type: ['text','image','video','voice','music'],
      keyword: 'string',
      // status: [0,1]
      status: [0,1]
    }
    try {
      let createRule = {
        keyword: keywordData.keyword,
        type: keywordData.type,
        status: keywordData.status
      }
      let result = {status:true};
      let createReply;
      let createReplyRes;
      switch (keywordData.type) {
        case 'text':
          rule.content = 'string';
          this.ctx.validate(rule, keywordData);

          createReply = {
            type: keywordData.type,
            content: keywordData.content
          }
          createReplyRes = await WxReply.create(createReply);
          createRule.reply_id = createReplyRes.reply_id;
          await WxRule.create(createRule);
          break;

        case 'image':
          rule.url = 'string';
          rule.status_type = [0,1];
          // rule.media_id = row.ruleReply.media_id;
          this.ctx.validate(rule, keywordData);

          createReply = {
            type: keywordData.type,
            url: keywordData.url,
            status_type: keywordData.status_type
          }
          result = await this.saveKeyword(keywordData, createRule, createReply);
          break;

        case 'video':
          rule.title = 'string';
          rule.content = 'string';
          rule.url = 'string';
          rule.status_type = [0,1];
          // rule.media_id = row.ruleReply.media_id;
          this.ctx.validate(rule, keywordData);

          createReply = {
            type: keywordData.type,
            url: keywordData.url,
            title: keywordData.title,
            content: keywordData.content,
            status_type: keywordData.status_type
          }
          result = await this.saveKeyword(keywordData, createRule, createReply);
          break;

        case 'voice':
          rule.title = 'string';
          rule.url = 'string';
          rule.status_type = [0,1];
          // rule.media_id = row.ruleReply.media_id;
          this.ctx.validate(rule, keywordData);

          createReply = {
            type: keywordData.type,
            url: keywordData.url,
            title: keywordData.title,
            status_type: keywordData.status_type
          }
          result = await this.saveKeyword(keywordData, createRule, createReply);
          break;

        case 'music':
          rule.title = 'string';
          rule.content = 'string';
          rule.url = 'string';
          rule.link = 'string';
          this.ctx.validate(rule, keywordData);
          createReply = {
            type: keywordData.type,
            title: keywordData.title,
            content: keywordData.content,
            url: keywordData.url,
            link: keywordData.link
          }
          createReplyRes = await WxReply.create(createReply);
          createRule.reply_id = createReplyRes.reply_id;
          await WxRule.create(createRule);
          break;
      }
      return result;
    } catch (err) {
      console.log('err：',err);
      if (err.code == 'invalid_param') {
        return {
          status: false,
          error: '参数错误'
        };
      } else {
        return {
          status: false,
          error: '服务错误'
        };
      }
    }
  }

  // 保存关键词
  async saveKeyword(keywordData, createRule, createReply) {
    const { ctx, service } = this;
    const { WxRule, WxReply } = ctx.model;
    try{
      // 判断是否为新增素材
      if (keywordData.url.indexOf('/') >= 0) {
        const uploadWxMediaRes = await this.uploadWxMedia(keywordData);
        if (uploadWxMediaRes.status) {
          createReply.media_id = uploadWxMediaRes.media_id;
        } else {
          return uploadWxMediaRes;
        }
        const createReplyRes = await WxReply.create(createReply);
        createRule.reply_id = createReplyRes.reply_id;
      } else {
        // 选旧素材
        const checkReply = await WxReply.findOne({
          where: {
            type: keywordData.type,
            media_id: keywordData.url
          }
        });
        if (checkReply) {
          createRule.reply_id = checkReply.reply_id;
        }
      }
      return {
        status: await WxRule.create(createRule)
      };
    } catch (err) {
      console.log('err：',err);
      throw err;
    }
  }

  // 多媒体上传到微信
  async uploadWxMedia(keywordData) {
    try{
      const { ctx, service } = this;
      const api = await service.wechatApi.index();
      const uploadFilePath = path.join(this.config.baseDir, 'app', keywordData.url);
      let uploadRes;
      if (keywordData.status_type == 1) {
        // 永久素材
        if (keywordData.type == 'video') {
          const description = {
            title: keywordData.title,
            introduction: keywordData.content
          };
          uploadRes = await api.uploadVideoMaterial(uploadFilePath,description);
        } else {
          uploadRes = await api.uploadMaterial(uploadFilePath,keywordData.type);
        }
      } else {
        // 临时素材
        uploadRes = await api.uploadMedia(uploadFilePath,keywordData.type);
      }
      uploadRes = JSON.parse(new Buffer(uploadRes).toString());
      console.log('------------uploadRes---------',uploadRes);
      if (uploadRes.errcode) {
        return {
          status: false,
          error: uploadRes.errmsg
        }
      } else {
        return {
          status: true,
          media_id: uploadRes.media_id
        };
      }
    } catch (err) {
      console.log('err：',err);
      throw err;
    }
  }

  // 更新关键词
  async updateKeyword(id, keywordData) {
    const { ctx, service } = this;
    const { WxRule, WxReply } = ctx.model;
    // 数据验证
    let rule = {
      keyword: 'string',
      // status: [0,1]
      status: [0,1]
    }

    try {
      const ruleInfo = await WxRule.findOne({
        where: {id: id}
      });
      if (ruleInfo) {
        let updateRule = {
          keyword: keywordData.keyword,
          status: keywordData.status
        }
        let media_id;
        let updateReply;
        let uploadWxMediaRes;
        let replyInfo;
        switch (ruleInfo.type) {
          case 'text':
            rule.content = 'string';
            this.ctx.validate(rule, keywordData);
           
            updateReply = {
              content: keywordData.content
            }
            await WxReply.update(updateReply,{where: {reply_id: ruleInfo.reply_id}});
            break;

          case 'image':
            rule.url = 'string';
            rule.status_type = [0,1];
            // rule.media_id = row.ruleReply.media_id;
            this.ctx.validate(rule, keywordData);

            replyInfo = await WxReply.findOne({
              where: {reply_id: ruleInfo.reply_id}
            });

            media_id = replyInfo.media_id;
            if (replyInfo && (replyInfo.url != keywordData.url || replyInfo.status_type != keywordData.status_type)) {
              // 更新图片
              keywordData.type = ruleInfo.type;
              uploadWxMediaRes = await this.uploadWxMedia(keywordData);
              if (uploadWxMediaRes.status) {
                media_id = uploadWxMediaRes.media_id;
              } else {
                return uploadWxMediaRes;
              }
            }
            updateReply = {
              url: keywordData.url,
              status_type: keywordData.status_type,
              media_id: media_id
            }
            await replyInfo.update(updateReply);
            break;

          case 'video':
            rule.title = 'string';
            rule.content = 'string';
            rule.url = 'string';
            rule.status_type = [0,1];
            // rule.media_id = row.ruleReply.media_id;
            this.ctx.validate(rule, keywordData);

            replyInfo = await WxReply.findOne({
              where: {reply_id: ruleInfo.reply_id}
            });

            media_id = replyInfo.media_id;
            if (replyInfo && (replyInfo.url != keywordData.url || replyInfo.status_type != keywordData.status_type)) {
              // 更新图片
              keywordData.type = ruleInfo.type;
              uploadWxMediaRes = await this.uploadWxMedia(keywordData);
              if (uploadWxMediaRes.status) {
                media_id = uploadWxMediaRes.media_id;
              } else {
                return uploadWxMediaRes;
              }
            }
            updateReply = {
              url: keywordData.url,
              status_type: keywordData.status_type,
              media_id: media_id
            }
            await replyInfo.update(updateReply);
            break;

          case 'voice':
            rule.title = 'string';
            rule.url = 'string';
            rule.status_type = [0,1];
            // rule.media_id = row.ruleReply.media_id;
            this.ctx.validate(rule, keywordData);

            replyInfo = await WxReply.findOne({
              where: {reply_id: ruleInfo.reply_id}
            });

            media_id = replyInfo.media_id;
            if (replyInfo && (replyInfo.url != keywordData.url || replyInfo.status_type != keywordData.status_type)) {
              // 更新图片
              keywordData.type = ruleInfo.type;
              uploadWxMediaRes = await this.uploadWxMedia(keywordData);
              if (uploadWxMediaRes.status) {
                media_id = uploadWxMediaRes.media_id;
              } else {
                return uploadWxMediaRes;
              }
            }
            updateReply = {
              url: keywordData.url,
              status_type: keywordData.status_type,
              media_id: media_id
            }
            await replyInfo.update(updateReply);
            break;

          case 'music':
            rule.title = 'string';
            rule.content = 'string';
            rule.url = 'string';
            rule.link = 'string';
            this.ctx.validate(rule, keywordData);

            updateReply = {
              title: keywordData.title,
              content: keywordData.content,
              url: keywordData.url,
              link: keywordData.link
            }
            await WxReply.update(updateReply,{where: {reply_id: ruleInfo.reply_id}});
            break;
        }
        await ruleInfo.update(updateRule);
      }
      return {
        status: true
      };
    } catch (err) {
      console.log('err：',err);
      if (err.code == 'invalid_param') {
        return {
          status: false,
          error: '参数错误'
        };
      } else {
        return {
          status: false,
          error: '服务错误'
        };
      }
    }
  }

  // 更新关键词启动/关闭
  async updateStatus(id) {
    const { ctx, service } = this;
    const { WxRule, WxReply } = ctx.model;
    try {
      const ruleInfo = await WxRule.findOne({
        where: {id: id}
      });
      if (ruleInfo) {
        let status = ruleInfo.status;
        if (ruleInfo.status == 1) {
          status = 0;
        } else {
          status = 1;
        }
        await ruleInfo.update({status: status});
      }
      return {
        status: true
      };
    } catch (err) {
      console.log('err：',err);
      return {
        status: false,
        error: '服务错误'
      };
    }
  }

  // 删除关键词
  async destroyKeyword(id) {
    try{
      const { ctx, service } = this;
      const { WxRule, WxReply } = ctx.model;
      const ruleInfo = await WxRule.findOne({
        where: {id: id}
      });
      if (ruleInfo && ruleInfo.reply_id) {
        const ReplyInfo = await WxReply.findOne({
          where: {reply_id: ruleInfo.reply_id}
        });
        if (ReplyInfo && ReplyInfo.media_id && ReplyInfo.status_type == 1) {
          const api = await service.wechatApi.index();
          // 删除永久
          await api.removeMaterial(ReplyInfo.media_id);
        }
        await ruleInfo.destroy();
        await ReplyInfo.destroy();
      }
      return {status:true};
    } catch (err) {
      console.log('err：',err);
      if (err.code == 'invalid_param') {
        return {
          status: false,
          error: '参数错误'
        };
      } else {
        return {
          status: false,
          error: '服务错误'
        };
      }
    }
  }

  // 获取特殊事件
  async getSpecial() {
    const { ctx } = this;
    const { WxRule } = ctx.model;
    const ruleList = await WxRule.findAll({
      where: {
        event: {
          $in: ['reply','subscribe']
        },
      }
    });

    let specialList = [];
    for (var i = 0; i < ruleList.length; i++) {
      let special = {
        label: await this.getSpecialLabel(ruleList[i].event),
        name: ruleList[i].event,
        type: ruleList[i].status,
        keyword: ruleList[i].keyword?ruleList[i].keyword:''
      };
      specialList.push(special);
    }
    return specialList
  }

  // 获取特殊事件label
  async getSpecialLabel(event) {
    let label;
    switch(event){
      case 'subscribe':
        label = '被关注回复';
        break;
      case 'reply':
        label = '收到消息回复';
        break;
    }
    return label;
  }

  // 更新特殊事件
  async updateSpecial(specialList) {
    try{
      const { ctx } = this;
      const { WxRule } = ctx.model;
      let rule = {
        name: ['subscribe','reply'],
        type: [0,1]
      }
      for (var i = 0; i < specialList.length; i++) {
        ctx.validate(rule, specialList[i]);
        let special = await WxRule.findOne({
          where: {event: specialList[i].name}
        });
        if (special) {
          if (specialList[i].type == 1) {
            // 更新
            if (specialList[i].keyword) {
              rule.keyword = 'string';
              ctx.validate(rule, specialList[i]);
              await special.update({
                status: specialList[i].type,
                keyword: specialList[i].keyword,
              });
            }
          } else {
            // 删除
            await special.update({
              status: specialList[i].type,
            });
          }
        }
      }
      return {
        status: true
      };
    } catch (err) {
      console.log('err：',err);
      if (err.code == 'invalid_param') {
        return {
          status: false,
          error: '参数错误'
        };
      } else {
        return {
          status: false,
          error: '服务错误'
        };
      }
    }
  }
}

module.exports = WxKeywordService;