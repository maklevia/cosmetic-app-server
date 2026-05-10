import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm";
import type { User } from "./User.js";
import type { Product } from "./Product.js";

@Entity("reviews")
@Unique(["user", "product"])
export class Review {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text", { name: "text_review" })
    textReview!: string;

    @Column("int", { name: "score_review" })
    scoreReview!: number;

    @CreateDateColumn({ type: "timestamp", name: "created_at" })
    createdAt!: Date;

    @Column("int", { name: "user_id", nullable: true })
    userId!: number | null;

    @Column("int", { name: "product_id" })
    productId!: number;

    @ManyToOne("User", "reviews", { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: "user_id" })
    user!: User | null;

    @ManyToOne("Product", "reviews", { onDelete: 'CASCADE' })
    @JoinColumn({ name: "product_id" })
    product!: Product;
}
