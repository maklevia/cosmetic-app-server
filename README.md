# Cosmetic Tracker API (Backend)

## 📌 Project Purpose & Core Mission
The **Cosmetic Tracker API** is a specialized backend solution designed to manage and monitor the complete lifecycle of cosmetic products. Unlike a simple inventory system, this API focuses on the **temporal safety** and **usage efficiency** of beauty products. 

In the cosmetics industry, products have two expiration milestones:
1.  **Shelf Life:** The date before which the product should be opened.
2.  **PAO (Period After Opening):** The duration (usually in months) the product remains safe *after* it has been unsealed.

This API bridges the gap between these two concepts, providing users with a proactive monitoring system to prevent the use of expired products, which can lead to skin irritation or infections.

## ⚙️ Core Functionality

### 1. Unified Product Catalog
The API maintains a dual-layer data structure:
*   **Global Products:** A pre-populated library of cosmetic items (brand, title, description) that serves as a template for users. This reduces manual data entry and ensures data consistency.
*   **Personal Collection:** Users "instantiate" global products into their personal collection, adding unique data like the date they actually opened the container and its specific PAO value.

### 2. Intelligent Expiration Logic
The server implements logic to calculate the **Actual Expiration Date** dynamically. By combining the `opened_date` with the `pao` (Period After Opening), the API determines exactly when a product becomes unsafe. 
*   **Active Monitoring:** Filters products into "Healthy", "Expiring Soon", and "Expired" states.
*   **Status Management:** Tracks whether a product is currently being used, has been completely used up, or was discarded due to expiration.

### 3. Usage Analytics & History
The API tracks the "Archive Reason" for every item. This allows the system (and future features) to provide insights into user habits, such as:
*   How often products are wasted (discarded before being finished).
*   Which brands/types of products are used most efficiently.

### 4. Community Feedback Loop
Through the **Reviews** system, users can contribute to the global catalog's quality by rating products. The API calculates an average score for each global product based on real user experiences.

## 🚀 Tech Stack
*   **Runtime:** Node.js (v18+) - Chosen for its non-blocking I/O, ideal for mobile backends.
*   **Framework:** Express.js - A minimalist web framework for building robust RESTful APIs.
*   **Language:** TypeScript - Ensures type safety across the complex data relations of products and collections.
*   **Database:** PostgreSQL - A powerful relational database for managing structured product and user data.
*   **ORM:** TypeORM - Provides a clean, object-oriented way to interact with the database.
*   **Security:** JWT for stateless session management and bcrypt for industry-standard password hashing.

## 🏗️ Architecture
The project follows a **Layered Architecture** pattern to ensure maintainability:
*   **Entities:** Define the "Source of Truth" for the database schema using TypeScript decorators.
*   **Controllers:** Handle the HTTP "glue" code—parsing requests, validating input, and returning standard JSON responses.
*   **Services:** The "Brain" of the application where expiration calculations and business rules reside.
*   **Middleware:** Centralized logic for authentication, logging, and file upload processing.

## 📋 Setup and Installation

### 1. Environment Variables
Create a `.env` file in the root of the `cosmetic-tracker-server` directory:

```env
PORT=3000
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=cosmetic_tracker
JWT_SECRET=your_super_secret_key
```

### 2. Database Setup (Docker)
The project includes a `docker-compose.yml` for a zero-config database setup:
```bash
docker-compose up -d
```

### 3. Install & Run
```bash
npm install
npm run dev
```

## 📡 API Reference Snapshot

| Category | Endpoint | Action |
| :--- | :--- | :--- |
| **User** | `POST /api/users/login` | Authenticate and receive a JWT. |
| **Catalog** | `GET /api/products/search` | Search the global database for specific items. |
| **Tracking** | `POST /api/collection` | Log a new product opening and start its countdown. |
| **Dashboard** | `GET /api/collection/dashboard` | Fetch items that require immediate attention (expiring). |
| **History** | `PUT /api/collection/:id` | Archive an item with a specific reason (expired/finished). |

## 📁 Project Structure
*   `src/entities/` — Database models (SQL Schemas).
*   `src/controllers/` — API Request handlers.
*   `src/services/` — Business logic & calculations.
*   `src/routes/` — URL routing definitions.
*   `uploads/` — Directory for product and avatar images.
