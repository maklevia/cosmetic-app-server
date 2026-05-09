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
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ["collectionItems", "collectionItems.product", "avatar", "collectionItems.product.image"]
        });

        if (!user) throw new Error("User not found");

        const avatarId = user.avatar?.id;

        const productRepository = AppDataSource.getRepository(Product);
        const collectionRepository = AppDataSource.getRepository(CollectionItem);

        // Identify unique products in the user's collection
        const productsToCheck = user.collectionItems
            .map(item => item.product)
            .filter(product => product.sourceStatus === SourceStatus.ADDED_MANUALLY);

        // Remove duplicates from the list of products to check
        const uniqueProducts = Array.from(new Map(productsToCheck.map(p => [p.id, p])).values());

        // We must delete the user first (which cascades to collection items) 
        await this.userRepository.remove(user);

        // Cleanup avatar if it exists
        if (avatarId) {
            try {
                await imageService.deleteImage(avatarId);
            } catch (e) {
                console.error("Failed to delete user avatar file:", e);
            }
        }

        // Now check if those manual products are orphaned
        for (const product of uniqueProducts) {
            const count = await collectionRepository.count({
                where: { product: { id: product.id } }
            });

            if (count === 0) {
                const productImageId = product.image?.id;
                await productRepository.delete(product.id);
                
                // If product had an image, delete it from storage
                if (productImageId) {
                    try {
                        await imageService.deleteImage(productImageId);
                    } catch (e) {
                        console.error("Failed to delete manual product image file:", e);
                    }
                }
            }
        }
    }
}
