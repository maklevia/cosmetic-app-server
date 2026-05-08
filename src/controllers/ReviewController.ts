import type { Request, Response } from "express";
import { ReviewService } from "../services/ReviewService.js";

const reviewService = new ReviewService();

export class ReviewController {
    async getByProduct(req: Request, res: Response) {
        try {
            const productId = parseInt((req.params["productId"] as string) || "0");
            const reviews = await reviewService.getReviewsByProduct(productId);
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: "Error fetching reviews", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { text_review, score_review, userId, productId } = req.body;
            const review = await reviewService.createReview({
                text_review,
                score_review,
                user: { id: userId } as any,
                product: { id: productId } as any
            });
            res.status(201).json(review);
        } catch (error) {
            res.status(500).json({ message: "Error creating review", error });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            const { text_review, score_review } = req.body;
            const review = await reviewService.updateReview(id, text_review, score_review);
            res.json(review);
        } catch (error) {
            res.status(500).json({ message: "Error updating review", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            await reviewService.deleteReview(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error deleting review", error });
        }
    }
}
