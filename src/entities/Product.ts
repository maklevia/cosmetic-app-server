import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import type { Image } from "./Image.js";
import type { Review } from "./Review.js";
import type { CollectionItem } from "./CollectionItem.js";

export enum SourceStatus {
    PARSED = "parsed",
    ADDED_MANUALLY = "added_manually"
}

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    title!: string;

    @Column("text")
    brand!: string;

    @Column("text")
    description!: string;

    @Column({
        type: "enum",
        enum: SourceStatus,
        default: SourceStatus.PARSED
    })
    source_status!: SourceStatus;

    @Column("numeric", { precision: 3, scale: 2, default: 0 })
    average_score!: number;

    @ManyToOne("Image", "products", { nullable: true })
    @JoinColumn({ name: "image_id" })
    image!: Image | null;

    @OneToMany("Review", "product")
    reviews!: Review[];

    @OneToMany("CollectionItem", "product")
    collectionItems!: CollectionItem[];
}
