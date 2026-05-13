# Cosmetic Tracker API Reference

This document provides a detailed technical reference for all available API endpoints.

## 🔑 Authentication
Most endpoints require a valid **JWT (JSON Web Token)** passed in the request header:
`Authorization: Bearer <your_token>`

---

## 👤 User Management (`/api/users`)

### Register
`POST /register`
*   **Body:** `{ "name": "...", "email": "...", "password": "..." }`
*   **Response:** `201 Created` with user object and JWT token.

### Login
`POST /login`
*   **Body:** `{ "email": "...", "password": "..." }`
*   **Response:** `200 OK` with user object and JWT token.

### Update Profile
`PUT /update-name` | `PUT /update-theme` | `PUT /update-language`
*   **Auth:** Required
*   **Body:** `{ "name": "..." }` | `{ "appTheme": "dark/light" }` | `{ "appLang": "en/uk" }`

### Change Password
`PUT /change-password`
*   **Auth:** Required
*   **Body:** `{ "currentPassword": "...", "newPassword": "..." }`

---

## 🧴 Global Catalog (`/api/products`)

### Get All Products
`GET /`
*   **Auth:** Required
*   **Query Params:** `limit` (optional)
*   **Response:** Array of product objects.

### Get Trending Products
`GET /trending`
*   **Auth:** Required
*   **Query Params:** `limit` (default: 10)
*   **Response:** Array of highly-ranked products based on the trending algorithm.

### Search Catalog
`GET /search?q=query_string`
*   **Auth:** Required
*   **Response:** Array of products matching the title or brand.

### Create Product (Manual)
`POST /`
*   **Auth:** Required
*   **Body:** `{ "title": "...", "brand": "...", "description": "...", "imageId": 1 }`
*   **Note:** Products created via this endpoint are marked as `added_manually`.

---

## 🎒 User Collection (`/api/collection`)

### Add to Collection
`POST /`
*   **Auth:** Required
*   **Body:** 
    ```json
    {
      "productId": 1,
      "openedDate": "2024-01-01",
      "pao": 12,
      "userAddedTitle": "My Morning Cream"
    }
    ```
*   **Description:** Starts the tracking lifecycle for a specific product.

### Get My Collection
`GET /`
*   **Auth:** Required
*   **Query Params:** `status` ('active' or 'archived')
*   **Response:** List of products in the user's personal inventory.

### Dashboard (Expiring Soon)
`GET /dashboard`
*   **Auth:** Required
*   **Description:** Returns products that are within 30 days of expiring.

### Archive/Update Item
`PUT /:id`
*   **Auth:** Required
*   **Body:** 
    ```json
    {
      "itemStatus": "archived",
      "archiveReason": "expired",
      "expiryRelation": "after"
    }
    ```

---

## 💬 Reviews (`/api/reviews`)

### Get Product Reviews
`GET /product/:productId`
*   **Response:** List of reviews for the specific global product.

### Create Review
`POST /`
*   **Auth:** Required
*   **Body:** `{ "productId": 1, "textReview": "Great product!", "scoreReview": 5 }`

---

## 🖼️ Images (`/api/images`)

### Upload Image
`POST /`
*   **Auth:** Required
*   **Content-Type:** `multipart/form-data`
*   **Field:** `image` (file)
*   **Response:** `201 Created` with the generated Image ID.

### Get Image Data
`GET /:id`
*   **Response:** Image metadata including filename and path.

---

## ⚠️ Error Responses
All endpoints return standard HTTP status codes:
*   `400 Bad Request`: Missing fields or invalid data.
*   `401 Unauthorized`: Invalid or missing JWT.
*   `404 Not Found`: Resource does not exist.
*   `500 Internal Server Error`: Server-side exception.
