import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: String(process.env.DB_PASSWORD as string),
  database: String(process.env.DB_DATABASE as string),
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("DB ga ulandi"))
  .catch((error: any) => {
    console.error(error.message);
    console.error(error);
  });

sequelize
  .sync({ force: false })
  .then(() => console.log("DB sync qilindi"))
  .catch((error: any) => {
    console.error(error.message);
    console.error(error);
  });

export default sequelize;