/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('wx_menu', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    index: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: '0'
    },
    pindex: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    type: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sort: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    status: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'wx_menu'
  });

  Model.associate = function() {

  }

  Model.deleteAll = function() {
    return this.destroy({
      where: {
        id: {
          '$gte': 0
        }
      }
    });
  }
  return Model;
};
