import type { Response } from "express";
import { ProductService } from "../services/ProductService.js";
import type { AuthRequest } from "../middleware/auth.js";
import { SourceStatus } from "../entities/Product.js";

const productService = new ProductService();

export class ProductController {
    async getAll(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const products = await productService.getAllProducts(userId);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: "Error fetching products", error });
        }
    }

    async getById(req: AuthRequest, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            const product = await productService.getProductById(id);
            
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            if (product.sourceStatus === SourceStatus.ADDED_MANUALLY) {
                const isOwner = product.collectionItems.some(ci => ci.userId === req.user?.id);
                if (!isOwner) {
                    return res.status(404).json({ message: "Product not found" });
                }
            }

            const { collectionItems, ...productData } = product;
            res.json(productData);
        } catch (error) {
            res.status(500).json({ message: "Error fetching product", error });
        }
    }

    async search(req: AuthRequest, res: Response) {
        try {
            const query = req.query["q"] as string;
            const userId = req.user?.id;
            
            if (!query) {
                return res.status(400).json({ message: "Search query is required" });
            }
            
            const products = await productService.searchProducts(query, userId);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: "Error searching products", error });
        }
    }

    async create(req: AuthRequest, res: Response) {
        try {
            const { title, brand, description } = req.body;
            const imageId = req.body.imageId || req.body.image_id;
            
            const product = await productService.createProduct({
                title,
                brand,
                description,
                sourceStatus: SourceStatus.ADDED_MANUALLY,
                image: imageId ? { id: imageId } as any : null
            });
            res.status(201).json(product);
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Error creating product", error });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            const updateData = { ...req.body };
            
            if (updateData.image_id !== undefined) {
                updateData.imageId = updateData.image_id;
                delete updateData.image_id;
            }

            const product = await productService.updateProduct(id, updateData);
            res.json(product);
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ message: "Error updating product", error });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const id = parseInt((req.params["id"] as string) || "0");
            await productService.deleteProduct(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error deleting product", error });
        }
    }
}
