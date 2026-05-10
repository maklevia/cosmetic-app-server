import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { Product, SourceStatus } from "../entities/Product.js";
import { CollectionItem } from "../entities/CollectionItem.js";
import bcrypt from "bcrypt";
import { ImageService } from "./ImageService.js";

const imageService = new ImageService();

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(userData: Partial<User>) {
        if (userData.passwordHash) {
            userData.passwordHash = await bcrypt.hash(userData.passwordHash, 10);
        }
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
    }

    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({ 
            where: { email },
            relations: ["avatar"] 
        });
    }

    async getUserById(id: number) {
        return await this.userRepository.findOne({ 
            where: { id },
            relations: ["avatar"] 
        });
    }

    async updateUser(id: number, updateData: Partial<User>) {
        if (updateData.passwordHash) {
            updateData.passwordHash = await bcrypt.hash(updateData.passwordHash, 10);
        }
        await this.userRepository.update(id, updateData);
        return this.getUserById(id);
    }

    async updateAvatar(userId: number, imageId: number) {
        await this.userRepository.update(userId, { avatar: { id: imageId } as any });
        return this.getUserById(userId);
    }

    async deleteUser(id: number) {
        // Load user with all relevant relations for cleanup
        const user = await this.userRepository.findOne({
            where: { id },
            relations: [
                "collectionItems", 
                "collectionItems.product", 
                "collectionItems.customImage",
                "avatar", 
                "collectionItems.product.image"
            ]
        });

        if (!user) throw new Error("User not found");

        const avatarId = user.avatar?.id;
        
        // Collect custom image IDs from collection items before they are deleted
        const customImageIds = user.collectionItems
            .map(item => item.customImage?.id)
            .filter((id): id is number => !!id);

        const productRepository = AppDataSource.getRepository(Product);
        const collectionRepository = AppDataSource.getRepository(CollectionItem);

        // Identify products that might become orphaned (added manually by this user)
        const productsToCheck = user.collectionItems
            .map(item => item.product)
            .filter((p): p is Product => !!p && p.sourceStatus === SourceStatus.ADDED_MANUALLY);

        // Unique products to check
        const uniqueProducts = Array.from(new Map(productsToCheck.map(p => [p.id, p])).values());

        // 1. Delete the user (this cascades to delete collection_items)
        await this.userRepository.remove(user);

        // 2. Cleanup User Avatar file and DB record
        if (avatarId) {
            try {
                await imageService.deleteImage(avatarId);
            } catch (e) {
                console.error(`Failed to cleanup user avatar ${avatarId}:`, e);
            }
        }

        // 3. Cleanup Custom Images from deleted collection items
        for (const imageId of customImageIds) {
            try {
                await imageService.deleteImage(imageId);
            } catch (e) {
                console.error(`Failed to cleanup custom image ${imageId}:`, e);
            }
        }

        // 4. Check and cleanup orphaned manual products
        for (const product of uniqueProducts) {
            try {
                const count = await collectionRepository.count({
                    where: { product: { id: product.id } }
                });

                if (count === 0) {
                    const productImageId = product.image?.id;
                    
                    // Delete product record (this will also delete its reviews due to CASCADE)
                    await productRepository.delete(product.id);
                    
                    // If product had an image, delete it
                    if (productImageId) {
                        try {
                            await imageService.deleteImage(productImageId);
                        } catch (e) {
                            console.error(`Failed to cleanup product image ${productImageId}:`, e);
                        }
                    }
                }
            } catch (e) {
                console.error(`Error during orphaned product cleanup for ${product.id}:`, e);
            }
        }
    }
}
