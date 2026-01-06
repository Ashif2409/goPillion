import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../database_connection/db.connection";

interface UserOTPAttributes {
  id: string;
  mobile: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
}

interface UserOTPCreationAttributes extends Optional<UserOTPAttributes, "id" | "verified"> {}

class UserOTP extends Model<UserOTPAttributes, UserOTPCreationAttributes> implements UserOTPAttributes {
  declare id: string;
  declare mobile: string;
  declare otp: string;
  declare expiresAt: Date;
  declare verified: boolean;
  
  // Add timestamps if you need them
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserOTP.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
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