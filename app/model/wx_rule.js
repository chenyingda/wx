/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('wx_rule', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    keyword: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    event: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    reply_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'wx_rule'
  });

  Model.associate = function() {
    /*Model.belongsTo(app.model.WxReply, {
      as: "ruleReply",
      foreignKey: "reply_id"
    })*/
  }

  return Model;
};
