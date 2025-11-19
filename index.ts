import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

import favoriteRoutes from "./routes/favorite.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import orderConfirmationRoutes from "./routes/order-confirmation.routes.js";

import "./models/category.model.js";
import "./models/product.model.js";
import "./models/favorite.model.js";
import "./models/cart.model.js";
import "./models/order.model.js";
import "./models/review.model.js";
import "./models/cancellation.model.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4001;

app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/order-confirmation", orderConfirmationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.listen(PORT, () => {
  console.log(`Server ishladi : ${PORT}`);
});