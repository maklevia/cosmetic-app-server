import { AppDataSource } from "../data-source.js";
import { CollectionItem, ItemStatus } from "../entities/CollectionItem.js";
import { Product, SourceStatus } from "../entities/Product.js";

export class CollectionService {
    private collectionRepository = AppDataSource.getRepository(CollectionItem);
    private productRepository = AppDataSource.getRepository(Product);

    async addItem(itemData: Partial<CollectionItem>) {
        const item = this.collectionRepository.create(itemData);
        return await this.collectionRepository.save(item);
    }

    async getCollectionByUser(userId: number, status: ItemStatus = ItemStatus.ACTIVE) {
        return await this.collectionRepository.find({
            where: { 
                user: { id: userId },
                item_status: status
            },
            relations: ["product", "product.image", "customImage"]
        });
    }

    async getSoonToExpire(userId: number) {
        return await this.collectionRepository
            .createQueryBuilder("item")
            .leftJoinAndSelect("item.product", "product")
            .leftJoinAndSelect("product.image", "image")
            .where("item.user_id = :userId", { userId })
            .andWhere("item.item_status = :active", { active: ItemStatus.ACTIVE })
            .andWhere("item.actual_expiration_date >= CURRENT_DATE")
            .orderBy("item.actual_expiration_date", "ASC")
            .limit(5)
            .getMany();
    }

    async searchInCollection(userId: number, query: string) {
        return await this.collectionRepository
            .createQueryBuilder("item")
            .leftJoinAndSelect("item.product", "product")
            .leftJoinAndSelect("product.image", "image")
            .where("item.user_id = :userId", { userId })
            .andWhere("(product.title ILIKE :query OR product.brand ILIKE :query OR item.user_added_title ILIKE :query)", { query: `%${query}%` })
            .getMany();
    }

    async deleteItem(id: number) {
        const item = await this.collectionRepository.findOne({
            where: { id },
            relations: ["product"]
        });

        if (!item) throw new Error("Collection item not found");

        const product = item.product;
        
        // Remove the item first
        await this.collectionRepository.remove(item);

        // Conditional Product Deletion:
        // If it's manually added, we should check if other users have it in their collection.
        // As per user requirements: "when user deletes collection item, we also delete product if it's status is added_manually"
        // To be safe, we check if ANY other collection item exists for this product.
        if (product.source_status === SourceStatus.ADDED_MANUALLY) {
            const otherItemsCount = await this.collectionRepository.count({
                where: { product: { id: product.id } }
            });

            if (otherItemsCount === 0) {
                await this.productRepository.delete(product.id);
            }
        }
    }

    async updateItem(id: number, updateData: Partial<CollectionItem>) {
        await this.collectionRepository.update(id, updateData);
        return await this.collectionRepository.findOne({ where: { id } });
    }
}
