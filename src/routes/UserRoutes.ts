import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes
router.get("/profile/:id", authMiddleware, userController.getProfile);
router.delete("/:id", authMiddleware, userController.deleteAccount);
router.put("/update-name", authMiddleware, userController.updateName);
router.put("/update-theme", authMiddleware, userController.updateTheme);
router.put("/update-language", authMiddleware, userController.updateLanguage);
router.put("/update-avatar", authMiddleware, userController.updateAvatar);
router.put("/change-password", authMiddleware, userController.changePassword);

// Reset password (public flow for now, usually requires email verification)
router.post("/reset-password", userController.resetPassword);

export default router;
