'use strict';

// had enabled by egg
// exports.static = true;
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize'
}

exports.ejs={
  enable:true,
  package:'egg-view-ejs'
}

exports.validate = {
  enable: true,
  package: "egg-validate"
}

exports.cors = {
  enable: true,
  package: "egg-cors"
}

exports.redis = {
  enable: true,
  package: 'egg-redis',
};

exports.jwt = {
  enable: true,
  package: "egg-jwt"
};