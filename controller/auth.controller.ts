import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";
import { DataTypes, Model } from "sequelize";
import { accessToken, refreshToken } from "../utils/token-generator.js";
import sendOtp from "../utils/send-otp.js";
import { AppError, catchAsync } from "../error/custom-error-hendler.js";
import type {
  RegisterDto,
  LoginDto,
  LoginResponseDto,
  RegisterResponseDto,
  ProfileResponseDto,
} from "../dto/auth.dto.js";

class User extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare phone: string | null;
  declare profile_image: string | null;
  declare otp: string | null;
  declare otp_expires_at: Date | null;
  declare is_verified: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

User.sync({force:false})

export const register = catchAsync(
  async (req: Request<{}, {}, RegisterDto>, res: Response<RegisterResponseDto>) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new AppError("Barcha maydonlar to'ldirilishi kerak", 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser && existingUser.is_verified) {
      throw new AppError("Bu email allaqachon ro'yxatdan o'tgan", 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    
    try {
      await sendOtp(email, otp);
    } catch (error) {
      throw new AppError("OTP yuborishda xatolik yuz berdi", 500);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (existingUser && !existingUser.is_verified) {
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otp_expires_at = otp_expires_at;
      await existingUser.save();

      res.status(200).json({
        message: "Yangi OTP yuborildi. Iltimos, emailingizni tekshiring",
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
        },
      });
    } else {
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        otp,
        otp_expires_at,
        is_verified: false,
      });

      res.status(201).json({
        message: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi. OTP yuborildi",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    }
  }
);

export const login = catchAsync(
  async (req: Request<{}, {}, LoginDto>, res: Response<LoginResponseDto>) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email va parol kiritilishi kerak", 400);
    }

    const user = await User.findOne({ 
      where: { email }
    });
    if (!user) {
      throw new AppError("Email yoki parol noto'g'ri", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Email yoki parol noto'g'ri", 401);
    }

    const payload = { id: user.id, email: user.email };
    const accessTokenToken = accessToken(payload);
    const refreshTokenToken = refreshToken(payload);

    res.status(200).json({
      message: "Muvaffaqiyatli kirildi",
      token: accessTokenToken,
      refreshToken: refreshTokenToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  }
);

export const getProfile = catchAsync(
  async (req: Request, res: Response<ProfileResponseDto>) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError("Avtorizatsiya kerak", 401);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("Foydalanuvchi topilmadi", 404);
    }

    res.status(200).json({
      user: {
        id: user.dataValues.id,
        username: user.dataValues.username,
        email: user.dataValues.email,
        createdAt: user.dataValues.createdAt,
      },
    });
  }
);

export const verifyOtp = catchAsync(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError("Email va OTP kiritilishi kerak", 400);
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError("Foydalanuvchi topilmadi", 404);
    }

    if (user.dataValues.is_verified) {
      throw new AppError("Bu email allaqachon tasdiqlangan", 400);
    }

    const storedOtp = String(user.dataValues.otp || "").trim();
    const inputOtp = String(otp).trim();

    if (storedOtp !== inputOtp) {
      console.log(storedOtp);
      console.log(inputOtp);
      
      throw new AppError("OTP noto'g'ri", 400);
    }

    if (user.dataValues.otp_expires_at && new Date() > user.dataValues.otp_expires_at) {
      throw new AppError("OTP muddati tugagan", 400);
    }

    user.dataValues.is_verified = true;
    user.dataValues.otp = null;
    user.dataValues.otp_expires_at = null;

    await user.save();

    res.status(200).json({
      message: "OTP muvaffaqiyatli tasdiqlandi",
      user: {
        id: user.dataValues.id,
        username: user.dataValues.username,
        email: user.dataValues.email,
        is_verified: user.dataValues.is_verified,
      },
    });
  }
);


export const logout = catchAsync(
  async (req: Request, res: Response) => {
    res.status(200).json({ message: "Muvaffaqiyatli chiqildi" });
  }
);

export default User;
