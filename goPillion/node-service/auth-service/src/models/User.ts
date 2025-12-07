import { Model, DataTypes } from "sequelize";
import sequelize from "../database_connection/db.connection";

class User extends Model {
  public id!: number;
  public mobile!: string;
  public name?: string;
  public role!: "USER" | "DRIVER" | "ADMIN";
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM("USER", "DRIVER"),
      defaultValue: "USER",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

export default User;
