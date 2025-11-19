import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

export default async function(email: string, otp: string) {
    try {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "abdullayevotabek414@gmail.com",
                pass: process.env.APP_PASS
            }
        })
        await transport.sendMail({
            from: "abdullayevotabek414@gmail.com",
            to:email,
            subject: "Tasdiqlash kodi",
            text: "Verification code from our application",
            html: `<p style="font-size: 24px">Tasdiqlash kodi: <strong style="color: green">${otp}</strong></p>`
        })
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        } else {
            throw new Error(String(error))
        }
    }
}