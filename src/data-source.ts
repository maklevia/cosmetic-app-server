import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { Image } from "./entities/Image.js";
import { User } from "./entities/User.js";
import { Product } from "./entities/Product.js";
import { Review } from "./entities/Review.js";
import { CollectionItem } from "./entities/CollectionItem.js";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: process.env.DATABASE_USER ?? "",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME ?? "",
    synchronize: true, // Set to false in production
    logging: false,
    entities: [Image, User, Product, Review, CollectionItem],
    migrations: [],
    subscribers: [],
});
