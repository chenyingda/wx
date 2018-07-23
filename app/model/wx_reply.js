/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('wx_reply', {
    reply_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    status_type: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    media_id: {
      type: DataTypes.STRING(120),
      allowNull: true
    }
  }, {
    tableName: 'wx_reply'
  });

  Model.associate = function() {

  }
  return Model;
};
