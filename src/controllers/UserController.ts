import type { Request, Response } from "express";
import { UserService } from "../services/UserService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userService = new UserService();
const JWT_SECRET = process.env["JWT_SECRET"] || "your_default_secret_keep_it_safe";

export class UserController {
    async register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;
            const normalizedEmail = email.toLowerCase();
            
            console.log(`Registering user: ${normalizedEmail}`);

            const existingUser = await userService.getUserByEmail(normalizedEmail);
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            const user = await userService.createUser({
                name,
                email: normalizedEmail,
                passwordHash: password
            });

            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

            const { passwordHash, ...userWithoutPassword } = user;
            res.status(201).json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "Error registering user", error });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const normalizedEmail = email.toLowerCase();
            
            console.log(`Login attempt for: ${normalizedEmail}`);

            const user = await userService.getUserByEmail(normalizedEmail);

            if (!user) {
                console.log(`Login failed: User ${normalizedEmail} not found`);
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                console.log(`Login failed: Invalid password for ${normalizedEmail}`);
                return res.status(401).json({ message: "Invalid email or password" });
            }

            console.log(`Login successful for: ${normalizedEmail}`);

            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

            const { passwordHash, ...userWithoutPassword } = user;
            res.json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Error logging in", error });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = parseInt((req.params["id"] as string) || "0");
            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const { passwordHash, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ message: "Error fetching profile", error });
        }
    }

    async deleteAccount(req: Request, res: Response) {
        try {
            const userId = parseInt((req.params["id"] as string) || "0");
            await userService.deleteUser(userId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error deleting account", error });
        }
    }

    async updateName(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { name } = req.body;
            const user = await userService.updateUser(userId, { name });
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Error updating name", error });
        }
    }

    async updateTheme(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const appTheme = req.body.appTheme || req.body.app_theme;
            const user = await userService.updateUser(userId, { appTheme });
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Error updating theme", error });
        }
    }

    async updateLanguage(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const appLang = req.body.appLang || req.body.app_lang;
            const user = await userService.updateUser(userId, { appLang });
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Error updating language", error });
        }
    }

    async updateAvatar(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { imageId } = req.body;
            const user = await userService.updateAvatar(userId, imageId);
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Error updating avatar", error });
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { currentPassword, newPassword } = req.body;

            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // 1. Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Incorrect current password" });
            }

            // 2. Update to new password
            await userService.updateUser(userId, { passwordHash: newPassword });
            res.json({ message: "Password updated successfully" });
        } catch (error) {
            console.error("Change password error:", error);
            res.status(500).json({ message: "Error changing password", error });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { email, newPassword } = req.body;
            const user = await userService.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            await userService.updateUser(user.id, { passwordHash: newPassword });
            res.json({ message: "Password reset successful" });
        } catch (error) {
            res.status(500).json({ message: "Error resetting password", error });
        }
    }
}
