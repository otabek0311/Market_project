import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

interface JWTPayload {
    id: number;
    email: string;
}

const accessToken = (payload: JWTPayload) => {
    try {
        return jwt.sign(payload, process.env.ACCESS_SECRET_KEY!, {
            expiresIn: "15m",
          });
    } catch (error) {
        throw new Error(String(error))
    } 
}

const refreshToken = (payload: JWTPayload) => {
    try {
        return jwt.sign(payload, process.env.REFRESH_SECRET_KEY!, {
            expiresIn: "15d",
          });
    } catch (error) {
        throw new Error(String(error))
    } 
}

export { accessToken, refreshToken };