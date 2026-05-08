import { Router } from "express";
import { CollectionController } from "../controllers/CollectionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const collectionController = new CollectionController();

// All collection routes require authentication
router.use(authMiddleware);

router.post("/", collectionController.add);
router.get("/", collectionController.getByUser);
router.get("/dashboard", collectionController.getDashboard);
router.get("/search", collectionController.search);
router.put("/:id", collectionController.update);
router.delete("/:id", collectionController.delete);

export default router;
