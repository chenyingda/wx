/**
 * 微信自定义菜单
 */
const Service = require('egg').Service;

class WxMenuService extends Service {
  // 获取菜单
  async getMenus() {
    const { WxMenu } = this.ctx.model;
    // 获取一级菜单
    let menus = await WxMenu.findAll({
      where: {
        pindex: 0
      },
      attributes: ['index','pindex','type','name','content']
    });
    if (menus) {
      // 获取二级菜单
      for (var i = 0; i < menus.length; i++) {
        let data;
        data = await WxMenu.findAll({
          where: {
            pindex: menus[i].index
          },
          attributes: ['index','pindex','type','name','content']
        });
        if (data) menus[i].dataValues.list = data;
      }
    }
    return menus;
  }

  // 保存并发布自定义菜单
  async createMenu(menus) {
    const { ctx, service } = this;
    const { WxMenu } = ctx.model;
    try{
      const api = await service.wechatApi.index();
      if (menus.length == 0) {
        // 空菜单认为删除全部菜单
        const res = await api.removeMenu();
        if (res.errcode == 0) {
          await WxMenu.deleteAll();
          return {
            status: true
          };
        } else {
          return {
            status: false,
            error: errcode.errmsg
          };
        }
      }

      // 删除数据现有菜单
      await WxMenu.deleteAll();
      // 添加新菜单
      const saveRes = await this.saveMenus(menus);
      if (!saveRes.status) {
        return saveRes;
      }
      // 获取发布微信的菜单数据
      const menu = await this.getTreeByWxMenu();
      // 发布自定义菜单
      const createMenuResult = await api.createMenu(menu);
      if (createMenuResult.errcode == 0) {
        return {status: true};
      } else {
        return {
          status: false,
          error: createMenuResult.errmsg
        };
      }

    } catch (err) {
      console.log('err：',err);
      return {
        status: false,
        error: '服务错误'
      };
    }
  }

  /**
    * 保存菜单
    */
  async saveMenus(menus) {
    const { WxMenu } = this.ctx.model;
    try{
      // 菜单规则
      const rule = {
        type: ['null', 'keys', 'link', 'event'],
        name: {
          type: 'string'
        },
        content: {
          type: 'string'
        }
      }
      for (var i = 0; i < menus.length; i++) {
        let index = i+1;
        let miniLength = menus[i].list.length;
        // 添加一级菜单
        let createMenuData = {
          index: index,
          pindex: 0,
          type: miniLength>0?'null':menus[i].type,
          name: menus[i].name,
          content: miniLength>0?'':menus[i].content
        };
        if (miniLength > 0) {
          const fRule = {
            type: ['null', 'keys', 'link', 'event'],
            name: {
              type: 'string'
            }
          }
          this.ctx.validate(fRule, createMenuData);
          await WxMenu.create(createMenuData);
          // 添加二级菜单
          for (var j = 0; j < menus[i].list.length; j++) {
            let miniMenu = menus[i].list[j];
            let miniIndex = j+1;
            let createMinMenuData = {
              index: index+''+miniIndex,
              pindex: index,
              type: miniMenu.type,
              name: miniMenu.name,
              content: miniMenu.content
            };
            this.ctx.validate(rule, createMinMenuData);
            await WxMenu.create(createMinMenuData);
          }
        }else{
          this.ctx.validate(rule, createMenuData);
          await WxMenu.create(createMenuData);
        }
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

  /**
    * 获取树状微信菜单
    */
  async getTreeByWxMenu() {
    const { WxMenu } = this.ctx.model;
    // 获取最新一级菜单
    let oneMenus = await WxMenu.findAll({
      where: {
        pindex: 0
      },
      order: ['id','index'],
      attributes: ['index','pindex','type','name','content']
    });
    // 开始组装微信菜单
    const wxMenu = [];
    let wxMenus = {
      button: wxMenu
    };

    // 循环组装成微信需要的菜单
    for (var i = 0; i < oneMenus.length; i++) {
      // 获取最新二级菜单
      let twoMenus = await WxMenu.findAll({
        where: {
          pindex: oneMenus[i].index
        },
        order: ['id','index'],
        attributes: ['index','pindex','type','name','content']
      });
      let menu_json = {};
      menu_json.name = oneMenus[i].name;
      if (twoMenus.length > 0) {
        // 有子菜单
        menu_json.sub_button = [];
        for (var j = 0; j < twoMenus.length; j++) {
          let twoMenus_json = {};
          twoMenus_json.name = twoMenus[j].name;
          if (twoMenus[j].type == 'link') {
            twoMenus_json.type = 'view';
            twoMenus_json.url = twoMenus[j].content;
            // 跳转链接
          } else if (twoMenus[j].type == 'keys') {
            // 关键词
            twoMenus_json.type = 'click';
            twoMenus_json.key = twoMenus[j].content;
          }
          menu_json.sub_button.push(twoMenus_json);
        }
      } else {
        // 无子菜单
        if (oneMenus[i].type == 'link') {
          menu_json.type = 'view';
          menu_json.url = oneMenus[i].content;
          // 跳转链接
        } else if (oneMenus[i].type == 'keys') {
          // 关键词
          menu_json.type = 'click';
          menu_json.key = oneMenus[i].content;
        }
      }
      wxMenu.push(menu_json);
    }
    return wxMenus;
  }
}

module.exports = WxMenuService;