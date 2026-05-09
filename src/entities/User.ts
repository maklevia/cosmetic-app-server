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

    @Column("text", { name: "password_hash" })
    passwordHash!: string;

    @Column({
        type: "enum",
        enum: AppTheme,
        default: AppTheme.LIGHT,
        name: "app_theme"
    })
    appTheme!: AppTheme;

    @Column({
        type: "enum",
        enum: AppLang,
        default: AppLang.EN,
        name: "app_lang"
    })
    appLang!: AppLang;

    @ManyToOne("Image", "users", { nullable: true })
    @JoinColumn({ name: "image_id" })
    avatar!: Image | null;

    @OneToMany("Review", "user")
    reviews!: Review[];

    @OneToMany("CollectionItem", "user")
    collectionItems!: CollectionItem[];
}
