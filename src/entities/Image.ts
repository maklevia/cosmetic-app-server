import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { User } from "./User.js";
import type { Product } from "./Product.js";
import type { CollectionItem } from "./CollectionItem.js";

@Entity("images")
export class Image {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    filename!: string;

    @Column("text")
    path!: string;

    @Column("text")
    extension!: string;

    @OneToMany("User", "avatar")
    users!: User[];

    @OneToMany("Product", "image")
    products!: Product[];

    @OneToMany("CollectionItem", "customImage")
    collectionItems!: CollectionItem[];
}
