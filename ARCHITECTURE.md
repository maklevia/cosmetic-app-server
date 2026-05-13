# System Architecture (Backend)

This document describes the architectural design, patterns, and logic used in the Cosmetic Tracker server.

## 🏛️ Architectural Pattern: Layered Architecture
The project follows a traditional layered approach to separate concerns and improve testability:

1.  **Routing Layer (`src/routes/`):** Defines the API surface area. It maps URLs to specific controller methods and attaches middleware (like authentication).
2.  **Controller Layer (`src/controllers/`):** Acts as an orchestrator. It extracts data from the HTTP request (params, body, query), calls the appropriate service, and formats the HTTP response.
3.  **Service Layer (`src/services/`):** Contains the "Heavy Lifting" and business rules. This is where complex logic (like calculating expiration dates or searching across multiple tables) lives.
4.  **Entity/Persistence Layer (`src/entities/`):** Uses TypeORM to map TypeScript classes to PostgreSQL tables. Defines relationships, constraints, and data types.

## 📊 Database Schema & Relationships
The system uses a relational model to manage the complex link between a user's personal inventory and a global catalog of products.

*   **User:** Stores profile information, preferences (language/theme), and authentication credentials.
*   **Product:** A global template containing generic info (brand, title, description).
*   **CollectionItem:** The most critical entity. It represents a specific instance of a `Product` owned by a `User`. It stores usage data (`openedDate`, `pao`).
*   **Image:** A shared entity for storing metadata about uploaded files (avatars or product photos).
*   **Review:** Links a `User` to a `Product` with a score and comment.

### Relationship Diagram (Simplified)
`User` (1) <---> (N) `CollectionItem` (N) <---> (1) `Product`
`Product` (1) <---> (N) `Review`
`Image` (1) <---> (N) `Product` / `User` / `CollectionItem`

## 🛡️ Authentication & Security
The API uses **Stateless JWT Authentication**:
1.  User sends credentials to `/api/users/login`.
2.  Server verifies password using `bcrypt.compare()`.
3.  Server generates a JWT signed with a secret key, containing the User ID.
4.  The client stores this token and sends it in the `Authorization` header for protected routes.
5.  `authMiddleware` intercepts requests to protected routes, verifies the token, and attaches the user object to the request.

## 🔄 Cosmetic Lifecycle Logic
The core "intelligence" of the API is the management of the product state:

### Expiration Calculation
The actual expiration date is not a static field for most cosmetics. The backend (and frontend) uses the formula:
`Actual Expiration = opened_date + PAO (months)`

### Status Transitions
An item in the collection moves through several states:
1.  **Active:** Currently in use.
2.  **Expiring:** Determined by the `getSoonToExpire` service logic (usually within 30 days).
3.  **Archived:** The terminal state. Requires an `ArchiveReason` (`expired` or `ran_out`) and an `ExpiryRelation` (`in_time`, `before`, `after`) to help users analyze their consumption habits.

## 📈 Trending Algorithm
To enhance user engagement, the API includes a discovery mechanism via the "Trending" feature. The popularity of a product is calculated dynamically using a weighted scoring system:

*   **Formula:** `Score = (Total Collection Adds * 1.0) + (Total Reviews * 0.5)`
*   **Filter:** The algorithm only considers "Parsed" products (official global catalog) to ensure high-quality recommendations.
*   **Implementation:** The server performs a grouped aggregation across `CollectionItem` and `Review` tables, sorts by the calculated score, and returns the top-ranked entities.

## 📁 File Handling
The server uses **Multer** for handling `multipart/form-data`.
*   Files are stored locally in the `uploads/` directory.
*   The database only stores the path and filename.
*   The `uploads/` directory is served as a static folder via Express, allowing the mobile app to access images directly via URL.
