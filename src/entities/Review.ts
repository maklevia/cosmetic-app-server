import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm";
import type { User } from "./User.js";
import type { Product } from "./Product.js";

@Entity("reviews")
@Unique(["user", "product"])
export class Review {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    text_review!: string;

    @Column("int")
    score_review!: number;

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date;

    @ManyToOne("User", "reviews", { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: "user_id" })
    user!: User | null;

    @ManyToOne("Product", "reviews")
    @JoinColumn({ name: "product_id" })
    product!: Product;
}
