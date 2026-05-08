import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from "./data-source.js";

import UserRoutes from "./routes/UserRoutes.js";
import ProductRoutes from "./routes/ProductRoutes.js";
import ReviewRoutes from "./routes/ReviewRoutes.js";
import CollectionRoutes from "./routes/CollectionRoutes.js";
import ImageRoutes from "./routes/ImageRoutes.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/users", UserRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/collection", CollectionRoutes);
app.use("/api/images", ImageRoutes);

// Basic routes (placeholders)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database connection and server start
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
