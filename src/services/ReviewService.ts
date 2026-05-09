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
        const userId = reviewData.user?.id;
        const productId = reviewData.product?.id;

        if (!userId || !productId) throw new Error("User ID and Product ID are required");

        // Check if user already reviewed this product
        let review = await this.reviewRepository.findOne({
            where: { 
                user: { id: userId },
                product: { id: productId }
            }
        });

        if (review) {
            review.textReview = reviewData.textReview || "";
            review.scoreReview = reviewData.scoreReview || 0;
        } else {
            review = this.reviewRepository.create(reviewData);
        }

        const savedReview = await this.reviewRepository.save(review);
        await this.updateProductAverageScore(productId);

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
        const saved = await this.reviewRepository.save(review);

        await this.updateProductAverageScore(review.product.id);

        return saved;
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
            .where("review.product_id = :productId", { productId })
            .getRawOne();

        const average = parseFloat(result.avg || "0");

        // Only update if we actually have a number to update
        if (!isNaN(average)) {
            await this.productRepository.update(productId, {
                averageScore: average
            });
        }
    }
}
