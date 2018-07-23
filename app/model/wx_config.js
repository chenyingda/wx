/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('wx_config', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    appid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    appsecret: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    encodingaeskey: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'wx_config'
  });

  Model.associate = function() {

  }

  return Model;
};
