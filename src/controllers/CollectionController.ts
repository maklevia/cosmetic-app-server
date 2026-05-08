import type { Request, Response } from "express";
import { CollectionService } from "../services/CollectionService.js";

const collectionService = new CollectionService();

export class CollectionController {
    async add(req: Request, res: Response) {
        try {
            const { userId, productId, opened_date, pao, actual_expiration_date, user_added_title, user_added_description } = req.body;
            const item = await collectionService.addItem({
                user: { id: userId } as any,
                product: { id: productId } as any,
                opened_date: new Date(opened_date),
                pao,
                actual_expiration_date: new Date(actual_expiration_date),
                user_added_title,
                user_added_description
            });
            res.status(201).json(item);
        } catch (error) {
            res.status(500).json({ message: "Error adding item to collection", error });
        }
    }

    async getByUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const status = req.query["status"] as any;
            const collection = await collectionService.getCollectionByUser(userId, status);
            res.json(collection);
        } catch (error) {
            res.status(500).json({ message: "Error fetching collection", error });
        }
    }

    async getDashboard(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const soonToExpire = await collectionService.getSoonToExpire(userId);
            res.json({ soonToExpire });
        } catch (error) {
            res.status(500).json({ message: "Error fetching dashboard", error });
        }
    }

    async search(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const query = req.query["q"] as string;
            if (!query) return res.status(400).json({ message: "Search query is required" });
            const results = await collectionService.searchInCollection(userId, query);
            res.json(results);
        } catch (error) {
            res.status(500).json({ message: "Error searching collection", error });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            const item = await collectionService.updateItem(id, req.body);
            res.json(item);
        } catch (error) {
            res.status(500).json({ message: "Error updating collection item", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            await collectionService.deleteItem(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error deleting collection item", error });
        }
    }
}
