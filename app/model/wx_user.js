/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('wx_user', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    openid: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    sex: {
      type: DataTypes.INTEGER(2),
      allowNull: true
    },
    subscribe: {
      type: DataTypes.INTEGER(2),
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    province: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    headimgurl: { 
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code_id:{
      type:DataTypes.INTEGER(11),
      allowNull:true
    },
    subscribe_time: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    unsubscribe_time: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'wx_user'
  });

  Model.associate = function() {
    Model.belongsTo(app.model.Wxcode,{foreignKey:'code_id'})
  }

  return Model;
};
