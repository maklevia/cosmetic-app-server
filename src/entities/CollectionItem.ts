import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { User } from "./User.js";
import type { Product } from "./Product.js";
import type { Image } from "./Image.js";

export enum ItemStatus {
    ACTIVE = "active",
    ARCHIVED = "archived"
}

@Entity("collection_items")
export class CollectionItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text", { nullable: true })
    user_added_title!: string | null;

    @Column("text", { nullable: true })
    user_added_description!: string | null;

    @Column("date")
    opened_date!: Date;

    @Column("int")
    pao!: number;

    @Column("date")
    actual_expiration_date!: Date;

    @Column({
        type: "enum",
        enum: ItemStatus,
        default: ItemStatus.ACTIVE
    })
    item_status!: ItemStatus;

    @Column({ name: "user_id" })
    userId!: number;

    @Column({ name: "product_id" })
    productId!: number;

    @ManyToOne("User", "collectionItems", { onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne("Product", "collectionItems", { onDelete: 'CASCADE' })
    @JoinColumn({ name: "product_id" })
    product!: Product;

    @ManyToOne("Image", "collectionItems", { nullable: true })
    @JoinColumn({ name: "user_added_image_id" })
    customImage!: Image | null;
}
