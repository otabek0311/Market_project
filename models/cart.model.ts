import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import Product from './product.model.js';

class Cart extends Model {
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
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
      onDelete: 'CASCADE',
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    tableName: 'carts',
    modelName: 'Cart',
  }
);

Cart.belongsTo(Product, { foreignKey: 'product_id' });

export default Cart;
