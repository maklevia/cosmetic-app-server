import { Router } from "express";
import { ProductController } from "../controllers/ProductController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const productController = new ProductController();

// All product routes require authentication
router.use(authMiddleware);

router.get("/", productController.getAll);
router.post("/", productController.create);
router.get("/search", productController.search);
router.get("/:id", productController.getById);
router.put("/:id", productController.update);
router.delete("/:id", productController.delete);

export default router;
