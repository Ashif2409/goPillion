// src/models/blockToken.model.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../database_connection/db.connection";

interface TokensAttributes {
  id?: number;
  token: string;
}

class Tokens extends Model<TokensAttributes> implements TokensAttributes {
  public id!: number;
  public token!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tokens.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT, // store long JWT
      allowNull: false,
      unique: true,
    }
  },
  {
    sequelize,
    tableName: "block_tokens",
    timestamps: true,
  }
);

export default Tokens;
