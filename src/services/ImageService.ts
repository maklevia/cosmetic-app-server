import { AppDataSource } from "../data-source.js";
import { Image } from "../entities/Image.js";
import fs from "fs";

export class ImageService {
    private imageRepository = AppDataSource.getRepository(Image);

    async createImage(imageData: Partial<Image>) {
        const image = this.imageRepository.create(imageData);
        return await this.imageRepository.save(image);
    }

    async getImageById(id: number) {
        return await this.imageRepository.findOne({ where: { id } });
    }

    async deleteImage(id: number) {
        const image = await this.imageRepository.findOne({ where: { id } });
        if (!image) throw new Error("Image not found");

        // Delete physical file
        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path);
        }

        return await this.imageRepository.remove(image);
    }

    async getAllImages() {
        return await this.imageRepository.find();
    }
}
