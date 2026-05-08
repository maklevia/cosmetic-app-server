import { AppDataSource } from "../data-source.js";
import { Product, SourceStatus } from "../entities/Product.js";

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);

    async getAllProducts(userId?: number) {
        // Returns all global products OR manual products belonging to the user's collection
        return await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.image", "image")
            .leftJoin("product.collectionItems", "ci")
            .where("product.source_status = :parsed", { parsed: SourceStatus.PARSED })
            .orWhere(
                "product.source_status = :manual AND ci.userId = :userId", 
                { manual: SourceStatus.ADDED_MANUALLY, userId }
            )
            .getMany();
    }

    async getProductById(id: number) {
        return await this.productRepository.findOne({
            where: { id },
            relations: ["image", "reviews", "reviews.user", "collectionItems"]
        });
    }

    async searchProducts(query: string, userId?: number) {
        // Visibility logic using SSOT:
        // 1. All 'parsed' products matching query
        // 2. 'added_manually' products matching query ONLY if they exist in the user's collection
        const products = await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.image", "image")
            .leftJoin("product.collectionItems", "ci")
            .where("(product.title ILIKE :query OR product.brand ILIKE :query)", { query: `%${query}%` })
            .andWhere(
                "(product.source_status = :parsed OR (product.source_status = :manual AND ci.userId = :userId))",
                { 
                    parsed: SourceStatus.PARSED, 
                    manual: SourceStatus.ADDED_MANUALLY, 
                    userId: userId || null 
                }
            )
            .getMany();

        return products;
    }

    async createProduct(productData: Partial<Product>) {
        const product = this.productRepository.create(productData);
        return await this.productRepository.save(product);
    }

    async updateProduct(id: number, updateData: Partial<Product>) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) throw new Error("Product not found");
        
        if (product.source_status !== SourceStatus.ADDED_MANUALLY) {
            throw new Error("Only manually added products can be updated");
        }

        await this.productRepository.update(id, updateData);
        return await this.getProductById(id);
    }

    async deleteProduct(id: number) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) throw new Error("Product not found");

        if (product.source_status !== SourceStatus.ADDED_MANUALLY) {
            throw new Error("Only manually added products can be deleted");
        }

        await this.productRepository.delete(id);
    }
}
