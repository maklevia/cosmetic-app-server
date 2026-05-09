import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { User } from "./User.js";
import type { Product } from "./Product.js";
import type { Image } from "./Image.js";

export enum ItemStatus {
    ACTIVE = "active",
    ARCHIVED = "archived"
}

export enum ArchiveReason {
    EXPIRED = "expired",
    RAN_OUT = "ran_out"
}

export enum ExpiryRelation {
    IN_TIME = "in_time",
    BEFORE = "before",
    AFTER = "after"
}

@Entity("collection_items")
export class CollectionItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text", { nullable: true, name: "user_added_title" })
    userAddedTitle!: string | null;

    @Column("text", { nullable: true, name: "user_added_description" })
    userAddedDescription!: string | null;

    @Column("date", { nullable: true, name: "opened_date" })
    openedDate!: Date | null;

    @Column("int", { nullable: true })
    pao!: number | null;

    @Column("date", { nullable: true, name: "actual_expiration_date" })
    actualExpirationDate!: Date | null;

    @Column({
        type: "enum",
        enum: ItemStatus,
        default: ItemStatus.ACTIVE,
        name: "item_status"
    })
    itemStatus!: ItemStatus;

    @Column({
        type: "enum",
        enum: ArchiveReason,
        nullable: true,
        name: "archive_reason"
    })
    archiveReason!: ArchiveReason | null;

    @Column({
        type: "enum",
        enum: ExpiryRelation,
        nullable: true,
        name: "expiry_relation"
    })
    expiryRelation!: ExpiryRelation | null;

    @Column("int", { name: "user_id" })
    userId!: number;

    @Column("int", { name: "product_id" })
    productId!: number;

    @Column("int", { name: "user_added_image_id", nullable: true })
    userAddedImageId!: number | null;

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
