import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import type { Image } from "./Image.js";
import type { Review } from "./Review.js";
import type { CollectionItem } from "./CollectionItem.js";

export enum AppTheme {
    LIGHT = "light",
    DARK = "dark"
}

export enum AppLang {
    EN = "EN",
    UA = "UA"
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    name!: string;

    @Column("text", { unique: true })
    email!: string;

    @Column("text")
    password_hash!: string;

    @Column({
        type: "enum",
        enum: AppTheme,
        default: AppTheme.LIGHT
    })
    app_theme!: AppTheme;

    @Column({
        type: "enum",
        enum: AppLang,
        default: AppLang.EN
    })
    app_lang!: AppLang;

    @ManyToOne("Image", "users", { nullable: true })
    @JoinColumn({ name: "image_id" })
    avatar!: Image | null;

    @OneToMany("Review", "user")
    reviews!: Review[];

    @OneToMany("CollectionItem", "user")
    collectionItems!: CollectionItem[];
}
