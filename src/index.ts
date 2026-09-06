import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./database/data-source";
import reviewRoutes from "./modules/review/review.routes";
import userRoutes from "./modules/user/user.routes"

dotenv.config();

const app = express();
// Middleware para paesear JSON en el req.body
app.use(express.json())
// Routes mounting
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected successfully.");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => console.error("Database connection error:", error));