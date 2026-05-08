import type { Request, Response } from "express";
import { ImageService } from "../services/ImageService.js";
import path from "path";

const imageService = new ImageService();

export class ImageController {
    async upload(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const image = await imageService.createImage({
                filename: req.file.filename,
                path: req.file.path,
                extension: path.extname(req.file.originalname).slice(1)
            });

            res.status(201).json(image);
        } catch (error) {
            res.status(500).json({ message: "Error uploading image", error });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            const image = await imageService.getImageById(id);
            if (!image) return res.status(404).json({ message: "Image not found" });
            res.json(image);
        } catch (error) {
            res.status(500).json({ message: "Error fetching image", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            await imageService.deleteImage(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error deleting image", error });
        }
    }
}
