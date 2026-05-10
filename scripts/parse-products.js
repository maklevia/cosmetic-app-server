import axios from 'axios';
import { AppDataSource } from '../src/data-source.js';
import { Product, SourceStatus } from '../src/entities/Product.js';
import { Image } from '../src/entities/Image.js';

const categoryIds = [23438, 23439, 23437, 37541, 24094, 22812];
const productsPerCategory = 20;

async function parseProducts() {
    try {
        console.log("🚀 Initializing database connection...");
        await AppDataSource.initialize();
        console.log("✅ Database connection initialized.");

        const productRepo = AppDataSource.getRepository(Product);
        const imageRepo = AppDataSource.getRepository(Image);

        for (const catId of categoryIds) {
            console.log(`\n📦 Fetching products for Category ID: ${catId}...`);
            // We use offset=0 to get the first page.
            const url = `https://makeup.com.ua/shop/v1/categories/${catId}/products/?offset=36`;
            
            const response = await axios.get(url, {
                headers: {
                    'accept-language': 'uk'
                }
            });
            const rawProducts = response.data.products || [];
            
            // Filter out items that aren't actual products (like "action" or "news")
            const actualProducts = rawProducts.filter(item => item.type === "product");
            
            const productsToProcess = actualProducts.slice(0, productsPerCategory);

            let addedCount = 0;
            let skippedCount = 0;

            for (const item of productsToProcess) {
                // Analysis of JSON mapping:
                // brand: From item.brand.title
                // title: From item.subTitle (Note the capital T in the sample)
                // description: From item.title (This is the long product name)
                // photo: item.media[0].url
                
                const brandName = item.brand?.title || "Unknown Brand";
                const description = item.subTitle || description;
                const title =  item.title || ""; 
                
                // Find primary image in media array
                const primaryMedia = Array.isArray(item.media) 
                    ? item.media.find(m => m.default) || item.media[0] 
                    : item.media;
                    
                const photoUrl = primaryMedia?.url;

                if (!photoUrl) {
                    skippedCount++;
                    continue;
                }

                // 1. Handle Image
                let image = await imageRepo.findOne({ where: { path: photoUrl } });
                if (!image) {
                    image = imageRepo.create({
                        filename: `${brandName}-${title}`.substring(0, 100).replace(/[^\w\s-]/gi, ''),
                        path: photoUrl,
                        extension: photoUrl.split('.').pop()?.split('?')[0] || 'jpg'
                    });
                    image = await imageRepo.save(image);
                }

                // 2. Handle Product (Upsert check by title and brand)
                let product = await productRepo.findOne({ 
                    where: { title, brand: brandName } 
                });

                if (!product) {
                    product = productRepo.create({
                        title,
                        brand: brandName,
                        description,
                        sourceStatus: SourceStatus.PARSED,
                        averageScore: 0,
                        image: image
                    });
                    await productRepo.save(product);
                    addedCount++;
                } else {
                    skippedCount++;
                }
            }
            console.log(`✅ Category ${catId} finished. Added: ${addedCount}, Skipped/Exists: ${skippedCount}`);
        }

        console.log("\n🎉 All categories processed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Critical error during parsing:", error);
        process.exit(1);
    }
}

parseProducts();
