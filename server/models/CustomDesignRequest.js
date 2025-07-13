// CustomDesignRequest.js - Sequelize model for custom_design_requests

module.exports = (sequelize, DataTypes) => {
  const CustomDesignRequest = sequelize.define('CustomDesignRequest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    product: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reference_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'custom_design_requests',
    timestamps: false
  });

  CustomDesignRequest.associate = models => {
    CustomDesignRequest.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return CustomDesignRequest;
};
