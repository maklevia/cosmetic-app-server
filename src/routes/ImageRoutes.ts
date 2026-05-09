import { Router } from "express";
import multer from "multer";
import path from "path";
import { ImageController } from "../controllers/ImageController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const imageController = new ImageController();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = (req.query.type as string) === "profile" ? "profiles" : "products";
        cb(null, `uploads/${type}`);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error("Only images are allowed"));
    }
});

// Routes
router.post("/upload", authMiddleware, upload.single("image"), imageController.upload);
router.get("/:id", imageController.getById);
router.delete("/:id", authMiddleware, imageController.delete);

export default router;
