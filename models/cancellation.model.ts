import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import Product from './product.model.js';

class Cancellation extends Model {
  public id!: number;
  public user_id!: number;
  public order_id!: number;
  public product_id!: number;
  public reason!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cancellation.init(
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
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'cancellations',
    modelName: 'Cancellation',
  }
);

// Associations
Cancellation.belongsTo(Product, { foreignKey: 'product_id' });

export default Cancellation;
