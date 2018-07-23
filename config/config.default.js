'use strict';
const path = require('path');

//open file  bash ~/sublime

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1529719246700_2087';

  // add your config here
  config.middleware = [];

  config.sequelize = {
    dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
    database: 'wx',
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: '123789fd',
    define: {
        // underscored: false,
        timestamps: false,
        // paranoid: true
    }
  };

  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '127.0.0.1',   // Redis host
      password: '',
      db: 0,
    },
  }

  config.cluster = {
    listen: {
      port: 8888
    }
  }
  config.logger = {
    dir: path.join(appInfo.baseDir, "logs")
  }
  config.security = {
    csrf: {
      enable: false
    }
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true
  };

  config.multipart = {
    fileSize: '10mb',
    whitelist: [
      '.jpg', '.jpeg', '.png', '.gif', '.bmp',
      '.mp3', '.mp4'
    ],
    fileExtensions: [
      '.wma', '.wav', '.amr'
    ]
  };

  config.bodyParser = {
    jsonLimit: '100mb',
  };

  config.view={
    mapping:{
      '.ejs':'ejs'
    }
  } 

  return config;
};


//是否加图文
//收到消息回复
//删除加弹窗
//登出token是否清除