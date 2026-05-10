import { AppDataSource } from "../data-source.js";
import { Product, SourceStatus } from "../entities/Product.js";

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);

    async getAllProducts(userId?: number) {
        // Returns all global products OR manual products belonging to the user's collection
        return await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.image", "productImage")
            .leftJoin("product.collectionItems", "ci")
            .where("product.sourceStatus = :parsed", { parsed: SourceStatus.PARSED })
            .orWhere(
                "product.sourceStatus = :manual AND ci.userId = :userId", 
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
                "(product.sourceStatus = :parsed OR (product.sourceStatus = :manual AND ci.userId = :userId))",
                { 
                    parsed: SourceStatus.PARSED, 
                    manual: SourceStatus.ADDED_MANUALLY, 
                    userId: userId || null 
                }
            )
            .getMany();

        return products;
    }

    async getTrendingProducts(limit: number = 10) {
        // Trending Algorithm:
        // Weight 1.0: Times added to collections
        // Weight 0.5: Number of reviews
        // Filter: Parsed products only
        
        // 1. Get ranked IDs using raw query to avoid complex grouping issues with relations
        const trendingRaw = await this.productRepository
            .createQueryBuilder("product")
            .leftJoin("product.collectionItems", "ci")
            .leftJoin("product.reviews", "r")
            .select("product.id", "id")
            .addSelect("COUNT(DISTINCT ci.id) * 1.0 + COUNT(DISTINCT r.id) * 0.5", "score")
            .where("product.sourceStatus = :parsed", { parsed: SourceStatus.PARSED })
            .groupBy("product.id")
            .orderBy("score", "DESC")
            .limit(limit)
            .getRawMany();

        const ids = trendingRaw.map(item => item.id);
        if (ids.length === 0) return [];

        // 2. Fetch full entities with images
        const products = await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.image", "productImage")
            .where("product.id IN (:...ids)", { ids })
            .getMany();

        // 3. Sort back to match the score order (since IN clause doesn't guarantee order)
        return ids.map(id => products.find(p => p.id === id)).filter(p => !!p);
    }

    async createProduct(productData: Partial<Product>) {
        const product = this.productRepository.create(productData);
        return await this.productRepository.save(product);
    }

    async updateProduct(id: number, updateData: Partial<Product>) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) throw new Error("Product not found");
        
        if (product.sourceStatus !== SourceStatus.ADDED_MANUALLY) {
            throw new Error("Only manually added products can be updated");
        }

        await this.productRepository.update(id, updateData);
        return await this.getProductById(id);
    }

    async deleteProduct(id: number) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) throw new Error("Product not found");

        if (product.sourceStatus !== SourceStatus.ADDED_MANUALLY) {
            throw new Error("Only manually added products can be deleted");
        }

        await this.productRepository.delete(id);
    }
}
