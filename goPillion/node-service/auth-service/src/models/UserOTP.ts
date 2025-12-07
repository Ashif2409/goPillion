import { Model, DataTypes } from "sequelize";
import sequelize from "../database_connection/db.connection";

class UserOTP extends Model {
  public id!: number;
  public mobile!: string;
  public otp!: string;
  public expiresAt!: Date;
  public verified!: boolean;
}

UserOTP.init(
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
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "user_otps",
    timestamps: true,
  }
);

export default UserOTP;
