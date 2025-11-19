import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import Product from './product.model.js';

class Favorite extends Model {
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'favorites',
    modelName: 'Favorite',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'product_id'],
      },
    ],
  }
);

Favorite.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

export default Favorite;
