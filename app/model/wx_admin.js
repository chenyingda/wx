/* indent size: 2 */
const moment=require('moment')
module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('wx_admin', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: ''
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: ''
    },
    create_time: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'wx_admin'
  });

  Model.associate = function() {

  }

  return Model;
};
