/**
 * 通用接口
 */
'use strict';
const fs = require('fs');
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const awaitWriteStream = require('await-stream-ready').write;
const Controller = require('egg').Controller;

class CommonController extends Controller {
  async upload() {
    const { ctx, config } = this;
    const time = new Date();
    Date.prototype.format = function(formatStr){   
      var str = formatStr;   
      str=str.replace(/yyyy|YYYY/,this.getFullYear());  
      str=str.replace(/MM/,(this.getMonth()+1)>9?(this.getMonth()+1).toString():'0' + (this.getMonth()+1));   
      str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());   
      return str;   
    } 
    const stream = await ctx.getFileStream();
    const filename = time.format("yyyyMMdd") + '_' + time.getTime() + path.extname(stream.filename).toLowerCase();
    // const filename = encodeURIComponent(stream.fieldname) + path.extname(stream.filename).toLowerCase();
    const target = path.join(this.config.baseDir, 'app/public/'+stream.fieldname, filename);

    // 过滤文件类型
    let check = true;
    let whileMineType = [];
    switch (stream.fieldname) {
      case 'image':
        // bmp/png/jpeg/jpg/gif 2M
        whileMineType = ['image/bmp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        break;
      case 'video':
        // mp4 10M
        whileMineType = ['video/mp4'];
        break;
      case 'voice':
        // mp3/wma/wav/amr 2M 60秒
        whileMineType = ['audio/mp3', 'audio/x-ms-wma', 'audio/wav', 'audio/amr'];
        break;
      case 'music':
        // mp3 5M
        whileMineType = ['audio/mp3'];
        break;
      default:
        check = false;
    }
    if (whileMineType.indexOf(stream.mimeType) == -1) {
      check = false;
    }
    if (!check) {
      ctx.body = {
        code: 400,
        error: '上传错误'
      };
      return;
    }

    const writeStream = fs.createWriteStream(target);
    try {
      await awaitWriteStream(stream.pipe(writeStream));
      const fileInfo = await fs.statSync(target);
      // 过滤文件大小
      let size = 0;
      switch (stream.fieldname) {
        case 'video':
          // mp4 10M
          size = 10*1024*1024;
          break;
        case 'image':
        case 'voice':
          // mp3/wma/wav/amr 2M 60秒
          size = 2*1024*1024;
          break;
        case 'music':
          // mp3 5M
          size = 5*1024*1024;
          break;
        default:
          check = false;
      }
      if (fileInfo.size > size) {
        check = false;
      }
      if (!check) {
        await fs.unlinkSync(target);
        ctx.body = {
          code: 400,
          error: '上传错误'
        };
        return;
      }
      ctx.body = {
        code: 200,
        url: '/public/' + stream.fieldname + '/' + filename,
        showUrl: 'http://' + ctx.host + '/public/' + stream.fieldname + '/' + filename
      };
    } catch (err) {
      await sendToWormhole(stream);
      console.log('err：',err);
      ctx.body = {
        code: 400,
        error: '上传失败'
      };
    }
  }
}

module.exports = CommonController;