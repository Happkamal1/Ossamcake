# API Documentation — Cake-web Backend

**Base URL:** `http://localhost:5000/api/v1`  
**Production URL:** `https://your-domain.com/api/v1`  
**Format:** All requests and responses use `application/json`  
**Authentication:** JWT stored in HTTP-only cookie (`token`)

---

## Response Format

Every API response follows this envelope:

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

Error responses:

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "success": false
}
```

---

## Authentication Legend

| Badge | Meaning |
|---|---|
| 🌐 Public | No login required |
| 🔐 Protected | Requires valid JWT cookie |
| 🔑 Admin | Requires `admin` or `super_admin` role |

---

---

# 1. AUTH  `/api/v1/auth`

## 1.1 Register

```
POST /api/v1/auth/register
```

🌐 Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response `201`:**
```json
{
  "message": "Registration successful. Check your email for OTP.",
  "data": { "email": "john@example.com" }
}
```

---

## 1.2 Verify Email (OTP)

```
POST /api/v1/auth/verify-email
```

🌐 Public

**Request Body:**
```json
{ "email": "john@example.com", "otp": "483921" }
```

**Response `200`:** Account activated, JWT cookie set.

---

## 1.3 Resend OTP

```
POST /api/v1/auth/resend-otp
```

🌐 Public

**Request Body:**
```json
{ "email": "john@example.com" }
```

---

## 1.4 Login

```
POST /api/v1/auth/login
```

🌐 Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response `200`:** JWT set as HTTP-only cookie.
```json
{
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "...", "role": "user" }
  }
}
```

---

## 1.5 Forgot Password

```
POST /api/v1/auth/forgot-password
```

🌐 Public

**Request Body:**
```json
{ "email": "john@example.com" }
```

---

## 1.6 Verify Reset OTP

```
POST /api/v1/auth/verify-reset-otp
```

🌐 Public

**Request Body:**
```json
{ "email": "john@example.com", "otp": "192847" }
```

---

## 1.7 Reset Password

```
POST /api/v1/auth/reset-password
```

🌐 Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "192847",
  "newPassword": "NewSecurePass123!"
}
```

---

## 1.8 Google OAuth Login

```
POST /api/v1/auth/google
```

🌐 Public

**Request Body:**
```json
{ "idToken": "<Google ID Token>" }
```

---

## 1.9 Logout

```
POST /api/v1/auth/logout
```

🔐 Protected — Clears JWT cookie.

---

## 1.10 Get Current User

```
GET /api/v1/auth/me
```

🔐 Protected

**Response `200`:**
```json
{
  "data": {
    "_id": "...", "name": "John Doe", "email": "...",
    "role": "user", "isEmailVerified": true
  }
}
```

---

## 1.11 Update Profile

```
PUT /api/v1/auth/profile
```

🔐 Protected

**Request Body:**
```json
{ "name": "John Updated", "phone": "+91-9876543210" }
```

---

## 1.12 Update Password

```
PUT /api/v1/auth/update-password
```

🔐 Protected

**Request Body:**
```json
{ "currentPassword": "OldPass123!", "newPassword": "NewPass456!" }
```

---

## 1.13 Add Address

```
POST /api/v1/auth/addresses
```

🔐 Protected

**Request Body:**
```json
{
  "label": "Home",
  "addressLine1": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India"
}
```

---

## 1.14 Delete Address

```
DELETE /api/v1/auth/addresses/:addressId
```

🔐 Protected

---

## 1.15 2FA Toggle

```
POST /api/v1/auth/2fa/toggle
```

🔐 Protected

---

## 1.16 Passkey (WebAuthn)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/auth/passkey/register-options` | Get options to register passkey |
| POST | `/api/v1/auth/passkey/register-verify` | Verify passkey registration |
| POST | `/api/v1/auth/passkey/login-options` | Get options to login with passkey |
| POST | `/api/v1/auth/passkey/login-verify` | Verify passkey login |
| POST | `/api/v1/auth/passkey/signup-options` | Get options to sign up via passkey |
| POST | `/api/v1/auth/passkey/signup-verify` | Verify passkey signup |
| DELETE | `/api/v1/auth/passkey/:credentialID` | Remove a saved passkey |

---

---

# 2. USERS  `/api/v1/users`

> All routes in this group require 🔐 **Protected** JWT.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/users/profile` | Get logged-in user profile |
| PATCH | `/api/v1/users/profile` | Update name, phone, avatar |
| POST | `/api/v1/users/avatar` | Upload avatar image (multipart/form-data) |
| PATCH | `/api/v1/users/change-password` | Change password |
| GET | `/api/v1/users/security` | Security info (2FA status, passkeys) |
| PATCH | `/api/v1/users/security/2fa` | Toggle 2FA on/off |
| GET | `/api/v1/users/passkeys` | List registered passkeys |
| DELETE | `/api/v1/users/passkeys/:id` | Delete a passkey |
| GET | `/api/v1/users/addresses` | List all saved delivery addresses |
| POST | `/api/v1/users/addresses` | Add new address |
| PATCH | `/api/v1/users/addresses/:id` | Update address |
| DELETE | `/api/v1/users/addresses/:id` | Delete address |
| PATCH | `/api/v1/users/addresses/:id/default` | Set as default address |

---

---

# 3. PRODUCTS (Public)  `/api/v1/products`

> All routes are 🌐 **Public**.

## 3.1 Get All Products (with Filters)

```
GET /api/v1/products
```

**Query Parameters:**

| Param | Type | Example | Description |
|---|---|---|---|
| `search` | string | `chocolate` | Full-text search on name + description |
| `category` | string | `Birthday Cakes` | Filter by category name or slug |
| `occasion` | string | `Birthday` | Filter by occasion name or slug |
| `cakeType` | string | `Premium Cakes` | Filter by cake type name |
| `flavor` | string | `Chocolate` | Filter by variant flavor (regex) |
| `minPrice` | number | `200` | Minimum base price |
| `maxPrice` | number | `2000` | Maximum base price |
| `isBestSeller` | boolean | `true` | Only best sellers |
| `isTrending` | boolean | `true` | Only trending cakes |
| `isFeatured` | boolean | `true` | Only featured cakes |
| `isTodaySpecial` | boolean | `true` | Only today's specials |
| `isNewArrival` | boolean | `true` | Only new arrivals |
| `sort` | string | `price-asc` | `rating-desc`, `price-asc`, `price-desc`, `name-asc`, `reviews-desc`, `createdAt-desc` |
| `page` | number | `1` | Page number (default: 1) |
| `limit` | number | `20` | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": {
    "cakes": [ { ...productObject } ],
    "pagination": { "total": 48, "page": 1, "pages": 3, "limit": 20 }
  }
}
```

---

## 3.2 Get Best Sellers

```
GET /api/v1/products/best-sellers
```

**Query:** `?limit=8`

**Response `200`:** Array of products where `isBestSeller: true`

---

## 3.3 Get Today's Specials

```
GET /api/v1/products/today-specials
```

**Query:** `?limit=4`

**Response `200`:** Array of products where `isTodaySpecial: true`

---

## 3.4 Get Trending

```
GET /api/v1/products/trending
```

**Query:** `?limit=4`

**Response `200`:** Array of products where `isTrending: true`

---

## 3.5 Get Featured

```
GET /api/v1/products/featured
```

**Query:** `?limit=8`

**Response `200`:** Array of products where `isFeatured: true`

---

## 3.6 Get New Arrivals

```
GET /api/v1/products/new-arrivals
```

**Query:** `?limit=8`

**Response `200`:** Array of products where `isNewArrival: true`

---

## 3.7 Get Recommended

```
GET /api/v1/products/recommended
```

**Query:** `?limit=6`

**Response `200`:** Products sorted by `rating` descending.

---

## 3.8 Search Products

```
GET /api/v1/products/search?q=chocolate&limit=10
```

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `q` | string | Search keyword |
| `limit` | number | Max results (default: 10) |

**Response `200`:** Array of `{ name, slug, thumbnail, basePrice, rating, reviewsCount }`

---

## 3.9 Get Related Products

```
GET /api/v1/products/related/:id
```

**Params:** `id` = MongoDB `_id` of the current cake  
**Query:** `?limit=4`

**Response `200`:** Products sharing same categories or cakeTypes, excluding the current one.

---

## 3.10 Get By Category Slug

```
GET /api/v1/products/category/:slug
```

**Example:** `GET /api/v1/products/category/birthday-cakes`  
**Query:** `?page=1&limit=20`

---

## 3.11 Get By Occasion Slug

```
GET /api/v1/products/occasion/:slug
```

**Example:** `GET /api/v1/products/occasion/anniversary`

---

## 3.12 Get By Cake Type Slug

```
GET /api/v1/products/cake-type/:slug
```

**Example:** `GET /api/v1/products/cake-type/premium-cakes`

---

## 3.13 Get Product By Slug (PDP)

```
GET /api/v1/products/slug/:slug
```

**Example:** `GET /api/v1/products/slug/ariston-signature`

**Response `200`:** Full product document with populated `categories`, `occasions`, `cakeTypes`.

---

## 3.14 Get Product By ID

```
GET /api/v1/products/:id
```

**Example:** `GET /api/v1/products/64abc12345ef`

---

## Product Object Schema

```json
{
  "_id": "64abc12345ef",
  "slug": "ariston-signature",
  "name": "Ariston Signature Chocolate Cake",
  "description": "Premium handcrafted chocolate cake...",
  "basePrice": 1299,
  "discount": 10,
  "thumbnail": "/uploads/products/ariston.jpg",
  "gallery": ["/uploads/products/ariston-2.jpg"],
  "isBestSeller": true,
  "isTodaySpecial": false,
  "isFeatured": true,
  "isTrending": false,
  "isNewArrival": false,
  "egglessAvailable": true,
  "egglessPremium": 50,
  "rating": 4.8,
  "reviewsCount": 124,
  "isSameDayDelivery": false,
  "status": "active",
  "categories": [{ "_id": "...", "name": "Birthday Cakes", "slug": "birthday-cakes" }],
  "occasions": [{ "_id": "...", "name": "Birthday", "slug": "birthday" }],
  "cakeTypes": [{ "_id": "...", "name": "Premium Cakes", "slug": "premium-cakes" }],
  "variants": [
    { "flavor": "Classic Dark Chocolate", "size": "0.5 kg", "price": 699, "stock": 10 },
    { "flavor": "Classic Dark Chocolate", "size": "1 kg", "price": 1299, "stock": 8 }
  ],
  "seo": {
    "metaTitle": "Ariston Signature Chocolate Cake",
    "metaDescription": "Order the best...",
    "keywords": ["chocolate cake", "premium cake"]
  }
}
```

---

---

# 4. CATEGORIES (Public)  `/api/v1/categories`

## 4.1 Get All Active Categories

```
GET /api/v1/categories
```

🌐 Public

**Response `200`:**
```json
{
  "data": [
    { "_id": "...", "name": "Birthday Cakes", "slug": "birthday-cakes", "image": "/...", "displayOrder": 1 }
  ]
}
```

---

---

# 5. OCCASIONS (Public)  `/api/v1/occasions`

## 5.1 Get All Active Occasions

```
GET /api/v1/occasions
```

🌐 Public

**Response `200`:**
```json
{
  "data": [
    { "_id": "...", "name": "Birthday", "slug": "birthday", "image": "/...", "displayOrder": 1 }
  ]
}
```

---

---

# 6. CAKE TYPES (Public)  `/api/v1/cake-types`

## 6.1 Get All Active Cake Types

```
GET /api/v1/cake-types
```

🌐 Public

**Response `200`:**
```json
{
  "data": [
    { "_id": "...", "name": "Premium Cakes", "slug": "premium-cakes", "description": "..." }
  ]
}
```

---

---

# 7. CART  `/api/v1/cart`

> All routes require 🔐 **Protected** JWT.

## 7.1 Get Cart

```
GET /api/v1/cart
```

**Response `200`:** Full cart document with items and totals.

---

## 7.2 Add Item to Cart

```
POST /api/v1/cart/add
```

**Request Body:**
```json
{
  "cakeId": "64abc12345ef",
  "variantIndex": 0,
  "quantity": 1,
  "isEggless": false,
  "cakeMessage": "Happy Birthday!",
  "deliveryDate": "2026-07-15",
  "deliveryTimeSlot": "Afternoon (12 PM - 4 PM)"
}
```

---

## 7.3 Apply Coupon

```
POST /api/v1/cart/coupon
```

**Request Body:**
```json
{ "code": "WELCOME10" }
```

---

## 7.4 Update Cart Item Quantity

```
PUT /api/v1/cart/:itemId
```

**Request Body:**
```json
{ "quantity": 2 }
```

---

## 7.5 Remove Cart Item

```
DELETE /api/v1/cart/:itemId
```

---

## 7.6 Clear Cart

```
DELETE /api/v1/cart
```

---

---

# 8. ORDERS  `/api/v1/orders`

## 8.1 Track Order (Public)

```
GET /api/v1/orders/:orderNumber
```

🌐 Public — Anyone with the order number can track.

**Response `200`:** Order document with status timeline.

---

## 8.2 Place Order

```
POST /api/v1/orders
```

🔐 Protected

**Request Body:**
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+91-9876543210",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "COD",
  "couponCode": "WELCOME10"
}
```

**Response `201`:**
```json
{
  "data": {
    "orderNumber": "ORD-20260707-001",
    "totalAmount": 1170,
    "status": "pending"
  }
}
```

---

## 8.3 Get My Orders

```
GET /api/v1/orders
```

🔐 Protected — Returns all orders for the logged-in user.

---

---

# 9. WISHLIST  `/api/v1/wishlist`

> All routes require 🔐 **Protected** JWT.

## 9.1 Get Wishlist

```
GET /api/v1/wishlist
```

**Response `200`:** Array of saved cake IDs.

---

## 9.2 Toggle Wishlist (Add / Remove)

```
POST /api/v1/wishlist/:cakeId
```

Adds the cake if not saved, removes if already saved.

---

---

# 10. ADMIN — Dashboard  `/api/v1/admin/dashboard`

> All admin routes require 🔑 **Admin or Super Admin** role.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/dashboard/stats` | Total products, orders, users, revenue |
| GET | `/api/v1/admin/dashboard/recent-orders` | Last N orders `?limit=10` |
| GET | `/api/v1/admin/dashboard/revenue-chart` | Monthly revenue `?year=2026` |
| GET | `/api/v1/admin/dashboard/top-products` | Best-performing products `?limit=5` |

---

---

# 11. ADMIN — Products  `/api/v1/admin/products`

🔑 Admin

## 11.1 Get All Products (Paginated)

```
GET /api/v1/admin/products
```

**Query:**

| Param | Description |
|---|---|
| `page` | Page number |
| `limit` | Items per page |
| `sort` | `price-asc`, `price-desc`, `name-asc`, `rating-desc`, `createdAt-desc` |
| `search` | Keyword filter |
| `status` | `active` \| `inactive` |
| `category` | Category name |

---

## 11.2 Get Product By ID

```
GET /api/v1/admin/products/:id
```

---

## 11.3 Create Product

```
POST /api/v1/admin/products
```

**Request Body:**
```json
{
  "name": "Chocolate Fudge Cake",
  "slug": "chocolate-fudge-cake",
  "description": "Rich dark chocolate layers...",
  "basePrice": 999,
  "discount": 15,
  "categories": ["<categoryId>"],
  "occasions": ["<occasionId>"],
  "cakeTypes": ["<cakeTypeId>"],
  "isBestSeller": false,
  "isFeatured": true,
  "isTrending": false,
  "isNewArrival": true,
  "egglessAvailable": true,
  "egglessPremium": 50,
  "thumbnail": "/uploads/products/cake.jpg",
  "gallery": [],
  "variants": [
    { "flavor": "Dark Chocolate", "size": "0.5 kg", "price": 549, "stock": 15 },
    { "flavor": "Dark Chocolate", "size": "1 kg", "price": 999, "stock": 10 }
  ],
  "seo": {
    "metaTitle": "Chocolate Fudge Cake",
    "metaDescription": "Best chocolate cake online",
    "keywords": ["chocolate", "fudge"]
  }
}
```

---

## 11.4 Update Product

```
PUT /api/v1/admin/products/:id
```

Same body as Create (all fields optional on update).

---

## 11.5 Toggle Product Flag

```
PATCH /api/v1/admin/products/:id/toggle-flag
```

**Request Body:**
```json
{ "flag": "isBestSeller", "value": true }
```

**Valid flags:** `isBestSeller`, `isFeatured`, `isTrending`, `isTodaySpecial`, `isNewArrival`

---

## 11.6 Soft Delete Product

```
DELETE /api/v1/admin/products/:id
```

Sets `status: "inactive"` — product hidden from public but kept in DB.

---

## 11.7 Hard Delete Product

```
DELETE /api/v1/admin/products/:id/permanent
```

Permanently removes the product from the database.

---

## 11.8 Upload Product Image

```
POST /api/v1/admin/products/upload
```

**Content-Type:** `multipart/form-data`  
**Field:** `image` (file)

**Response `200`:**
```json
{ "data": { "url": "/uploads/products/product-1720342812345.jpg" } }
```

---

---

# 12. ADMIN — Categories  `/api/v1/admin/categories`

🔑 Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/categories` | List all (active + inactive) with pagination |
| GET | `/api/v1/admin/categories/:id` | Get single category |
| POST | `/api/v1/admin/categories` | Create new category |
| PUT | `/api/v1/admin/categories/:id` | Update category |
| DELETE | `/api/v1/admin/categories/:id` | Delete category |

**Create/Update Body:**
```json
{
  "name": "Birthday Cakes",
  "slug": "birthday-cakes",
  "image": "/uploads/categories/birthday.jpg",
  "displayOrder": 1,
  "isActive": true
}
```

---

---

# 13. ADMIN — Occasions  `/api/v1/admin/occasions`

🔑 Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/occasions` | List all occasions |
| GET | `/api/v1/admin/occasions/:id` | Get single occasion |
| POST | `/api/v1/admin/occasions` | Create occasion |
| PUT | `/api/v1/admin/occasions/:id` | Update occasion |
| DELETE | `/api/v1/admin/occasions/:id` | Delete occasion |

**Create/Update Body:**
```json
{
  "name": "Valentine's Day",
  "slug": "valentines-day",
  "image": "/uploads/occasions/valentine.jpg",
  "displayOrder": 1,
  "isActive": true
}
```

---

---

# 14. ADMIN — Cake Types  `/api/v1/admin/cake-types`

🔑 Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/cake-types` | List all cake types |
| GET | `/api/v1/admin/cake-types/:id` | Get single cake type |
| POST | `/api/v1/admin/cake-types` | Create cake type |
| PUT | `/api/v1/admin/cake-types/:id` | Update cake type |
| DELETE | `/api/v1/admin/cake-types/:id` | Delete cake type |

**Create/Update Body:**
```json
{
  "name": "Premium Cakes",
  "slug": "premium-cakes",
  "description": "Exquisite gourmet recipes.",
  "isActive": true
}
```

---

---

# 15. ADMIN — Orders  `/api/v1/admin/orders`

🔑 Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/orders` | All orders with filters (`?status=pending&page=1`) |
| GET | `/api/v1/admin/orders/stats` | Order statistics |
| GET | `/api/v1/admin/orders/:id` | Single order details |
| PATCH | `/api/v1/admin/orders/:id/status` | Update order status |

**Update Status Body:**
```json
{ "status": "processing" }
```

**Valid statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

---

---

# 16. ADMIN — Users  `/api/v1/admin/users`

🔑 Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/users` | All users with pagination/search |
| GET | `/api/v1/admin/users/:id` | Single user details |
| PATCH | `/api/v1/admin/users/:id/status` | Block or activate user |
| PATCH | `/api/v1/admin/users/:id/role` | Change user role |

**Update Status Body:**
```json
{ "accountStatus": "blocked" }
```

**Update Role Body:**
```json
{ "role": "admin" }
```

---

---

# 17. ADMIN — Reviews  `/api/v1/admin/reviews`

🔑 Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/reviews` | All reviews with filters (`?approved=false`) |
| PATCH | `/api/v1/admin/reviews/:id/approve` | Approve a review |
| DELETE | `/api/v1/admin/reviews/:id` | Delete a review |

---

---

# 18. ADMIN — Coupons  `/api/v1/admin/coupons`

🔑 Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/coupons` | List all coupons |
| GET | `/api/v1/admin/coupons/:id` | Get single coupon |
| POST | `/api/v1/admin/coupons` | Create coupon |
| PUT | `/api/v1/admin/coupons/:id` | Update coupon |
| DELETE | `/api/v1/admin/coupons/:id` | Delete coupon |

**Create/Update Body:**
```json
{
  "code": "SWEET20",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderValue": 500,
  "maxUses": 100,
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "isActive": true
}
```

---

---

# 19. ADMIN — Banners  `/api/v1/admin/banners`

🔑 Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/banners` | List all banners |
| POST | `/api/v1/admin/banners` | Create banner |
| PUT | `/api/v1/admin/banners/:id` | Update banner |
| DELETE | `/api/v1/admin/banners/:id` | Delete banner |

**Create/Update Body:**
```json
{
  "title": "Handcrafted Luxury in Every Slice",
  "subtitle": "Experience premium cakes.",
  "badge": "Masterpiece Collection",
  "ctaText": "Explore Signature Menu",
  "ctaLink": "/shop?category=Premium Cakes",
  "image": "/uploads/banners/hero-1.jpg",
  "displayOrder": 1,
  "isActive": true
}
```

---

---

# 20. Health Check

```
GET /health
```

🌐 Public

**Response `200`:**
```json
{
  "status": "ok",
  "environment": "development",
  "timestamp": "2026-07-07T09:30:00.000Z"
}
```

---

---

## Complete Route Summary

| # | Module | Base Path | Methods | Auth |
|---|---|---|---|---|
| 1 | Auth | `/api/v1/auth` | POST, GET, PUT, DELETE | 🌐 / 🔐 |
| 2 | Users | `/api/v1/users` | GET, PATCH, POST, DELETE | 🔐 |
| 3 | Products | `/api/v1/products` | GET | 🌐 |
| 4 | Categories | `/api/v1/categories` | GET | 🌐 |
| 5 | Occasions | `/api/v1/occasions` | GET | 🌐 |
| 6 | Cake Types | `/api/v1/cake-types` | GET | 🌐 |
| 7 | Cart | `/api/v1/cart` | GET, POST, PUT, DELETE | 🔐 |
| 8 | Orders | `/api/v1/orders` | GET, POST, PATCH | 🌐 / 🔐 |
| 9 | Wishlist | `/api/v1/wishlist` | GET, POST | 🔐 |
| 10 | Admin Dashboard | `/api/v1/admin/dashboard` | GET | 🔑 |
| 11 | Admin Products | `/api/v1/admin/products` | GET, POST, PUT, PATCH, DELETE | 🔑 |
| 12 | Admin Categories | `/api/v1/admin/categories` | GET, POST, PUT, DELETE | 🔑 |
| 13 | Admin Occasions | `/api/v1/admin/occasions` | GET, POST, PUT, DELETE | 🔑 |
| 14 | Admin Cake Types | `/api/v1/admin/cake-types` | GET, POST, PUT, DELETE | 🔑 |
| 15 | Admin Orders | `/api/v1/admin/orders` | GET, PATCH | 🔑 |
| 16 | Admin Users | `/api/v1/admin/users` | GET, PATCH | 🔑 |
| 17 | Admin Reviews | `/api/v1/admin/reviews` | GET, PATCH, DELETE | 🔑 |
| 18 | Admin Coupons | `/api/v1/admin/coupons` | GET, POST, PUT, DELETE | 🔑 |
| 19 | Admin Banners | `/api/v1/admin/banners` | GET, POST, PUT, DELETE | 🔑 |
| 20 | Health | `/health` | GET | 🌐 |

---

*Last updated: 2026-07-07 | Total endpoints: 80+*
