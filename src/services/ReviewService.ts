import { AppDataSource } from "../data-source.js";
import { Review } from "../entities/Review.js";
import { Product } from "../entities/Product.js";

export class ReviewService {
    private reviewRepository = AppDataSource.getRepository(Review);
    private productRepository = AppDataSource.getRepository(Product);

    async getReviewsByProduct(productId: number) {
        return await this.reviewRepository.find({
            where: { product: { id: productId } },
            relations: ["user", "user.avatar"],
            order: { createdAt: "DESC" }
        });
    }

    async createReview(reviewData: Partial<Review>) {
        const review = this.reviewRepository.create(reviewData);
        const savedReview = await this.reviewRepository.save(review);
        
        // Update product average score
        if (reviewData.product) {
            await this.updateProductAverageScore(reviewData.product.id);
        }
        
        return savedReview;
    }

    async updateReview(id: number, text: string, score: number) {
        const review = await this.reviewRepository.findOne({ 
            where: { id },
            relations: ["product"]
        });
        
        if (!review) throw new Error("Review not found");

        review.textReview = text;
        review.scoreReview = score;
        await this.reviewRepository.save(review);

        await this.updateProductAverageScore(review.product.id);
        
        return review;
    }

    async deleteReview(id: number) {
        const review = await this.reviewRepository.findOne({ 
            where: { id },
            relations: ["product"]
        });
        
        if (!review) throw new Error("Review not found");

        const productId = review.product.id;
        await this.reviewRepository.remove(review);
        await this.updateProductAverageScore(productId);
    }

    private async updateProductAverageScore(productId: number) {
        const result = await this.reviewRepository
            .createQueryBuilder("review")
            .select("AVG(review.scoreReview)", "avg")
            .where("review.productId = :productId", { productId })
            .getRawOne();

        const average = parseFloat(result.avg || "0");

        await this.productRepository.update(productId, {
            averageScore: average
        });
    }

}
