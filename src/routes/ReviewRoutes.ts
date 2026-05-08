import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const reviewController = new ReviewController();

// Public read access
router.get("/product/:productId", reviewController.getByProduct);

// Protected mutations
router.post("/", authMiddleware, reviewController.create);
router.put("/:id", authMiddleware, reviewController.update);
router.delete("/:id", authMiddleware, reviewController.delete);

export default router;
