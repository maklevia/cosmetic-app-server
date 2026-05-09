import type { Request, Response } from "express";
import { CollectionService } from "../services/CollectionService.js";

const collectionService = new CollectionService();

export class CollectionController {
    async add(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const productId = req.body.productId || req.body.product_id;
            const openedDateRaw = req.body.openedDate || req.body.opened_at || req.body.opened_date;
            const pao = req.body.pao;
            const { userAddedTitle, userAddedDescription, userAddedImageId } = req.body;
            
            console.log(`Adding product ${productId} to collection for user ${userId}`);

            if (!productId) {
                return res.status(400).json({ message: "Product ID is required" });
            }

            const openedDate = openedDateRaw ? new Date(openedDateRaw) : null;
            const actualExpirationDate = req.body.actualExpirationDate || req.body.actual_expiration_date || req.body.expires_at 
                ? new Date(req.body.actualExpirationDate || req.body.actual_expiration_date || req.body.expires_at) 
                : null;

            const item = await collectionService.addItem({
                user: { id: userId } as any,
                product: { id: productId } as any,
                openedDate,
                pao: pao ? parseInt(pao) : null,
                actualExpirationDate,
                userAddedTitle,
                userAddedDescription,
                customImage: userAddedImageId ? { id: userAddedImageId } as any : undefined
            });
            res.status(201).json(item);
        } catch (error) {
            console.error("Error adding to collection:", error);
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
            const updateData: any = { ...req.body };
            
            // Map app fields to entity properties (handle both styles during transition)
            if (updateData.user_added_image_id !== undefined) {
                updateData.userAddedImageId = updateData.user_added_image_id;
                delete updateData.user_added_image_id;
            }

            if (updateData.user_added_title !== undefined) {
                updateData.userAddedTitle = updateData.user_added_title;
                delete updateData.user_added_title;
            }

            if (updateData.user_added_description !== undefined) {
                updateData.userAddedDescription = updateData.user_added_description;
                delete updateData.user_added_description;
            }

            if (updateData.item_status !== undefined) {
                updateData.itemStatus = updateData.item_status;
                delete updateData.item_status;
            }

            if (updateData.archive_reason !== undefined) {
                updateData.archiveReason = updateData.archive_reason;
                delete updateData.archive_reason;
            }

            if (updateData.expiry_relation !== undefined) {
                updateData.expiryRelation = updateData.expiry_relation;
                delete updateData.expiry_relation;
            }
            
            if (updateData.openedDate) {
                updateData.openedDate = new Date(updateData.openedDate);
            } else if (updateData.opened_date) {
                updateData.openedDate = new Date(updateData.opened_date);
                delete updateData.opened_date;
            }

            const item = await collectionService.updateItem(id, updateData);
            res.json(item);
        } catch (error) {
            console.error("Error updating collection item:", error);
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
