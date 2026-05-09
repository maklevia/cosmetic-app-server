import { AppDataSource } from "../data-source.js";
import { CollectionItem, ItemStatus } from "../entities/CollectionItem.js";
import { Product, SourceStatus } from "../entities/Product.js";
import { ImageService } from "./ImageService.js";

const imageService = new ImageService();

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
                itemStatus: status
            },
            relations: ["product", "product.image", "product.reviews", "customImage"]
        });
    }

    async getSoonToExpire(userId: number) {
        return await this.collectionRepository
            .createQueryBuilder("item")
            .leftJoinAndSelect("item.product", "product")
            .leftJoinAndSelect("product.image", "image")
            .leftJoinAndSelect("product.reviews", "reviews")
            .leftJoinAndSelect("item.customImage", "customImage")
            .where("item.userId = :userId", { userId })
            .andWhere("item.itemStatus = :active", { active: ItemStatus.ACTIVE })
            .orderBy("item.openedDate", "ASC")
            .getMany();
    }

    async searchInCollection(userId: number, query: string) {
        return await this.collectionRepository
            .createQueryBuilder("item")
            .leftJoinAndSelect("item.product", "product")
            .leftJoinAndSelect("product.image", "image")
            .leftJoinAndSelect("product.reviews", "reviews")
            .leftJoinAndSelect("item.customImage", "customImage")
            .where("item.userId = :userId", { userId })
            .andWhere("(product.title ILIKE :query OR product.brand ILIKE :query OR item.userAddedTitle ILIKE :query)", { query: `%${query}%` })
            .orderBy("item.itemStatus", "ASC") // 'active' comes before 'archived'
            .getMany();
    }

    async deleteItem(id: number) {
        const item = await this.collectionRepository.findOne({
            where: { id },
            relations: ["product", "product.image", "customImage"]
        });

        if (!item) throw new Error("Collection item not found");

        const product = item.product;
        const customImageId = item.customImage?.id;
        
        await this.collectionRepository.remove(item);

        // 1. Cleanup customImage if it exists
        if (customImageId) {
            try {
                await imageService.deleteImage(customImageId);
            } catch (e) {
                console.error("Failed to delete custom image file:", e);
            }
        }

        // 2. If product is manual, check if it's now orphaned
        if (product.sourceStatus === SourceStatus.ADDED_MANUALLY) {
            const otherItemsCount = await this.collectionRepository.count({
                where: { product: { id: product.id } }
            });

            if (otherItemsCount === 0) {
                const productImageId = product.image?.id;
                await this.productRepository.delete(product.id);
                
                // If global product had an image, delete it
                if (productImageId) {
                    try {
                        await imageService.deleteImage(productImageId);
                    } catch (e) {
                        console.error("Failed to delete orphaned manual product image file:", e);
                    }
                }
            }
        }
    }

    async updateItem(id: number, updateData: Partial<CollectionItem>) {
        await this.collectionRepository.update(id, updateData);
        return await this.collectionRepository.findOne({ 
            where: { id },
            relations: ["product", "product.image", "product.reviews", "customImage"]
        });
    }
}
