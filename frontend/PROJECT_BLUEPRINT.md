# Cake Website Project Blueprint

This document serves as the single source of truth for the architecture, component hierarchy, data flow, and roadmap of the Cake Website project. Read this before adding new features.

---

## 1. Architecture Overview
- **Framework**: React 19 (Client-side SPA) powered by Vite.
- **Routing**: `react-router-dom` (v7).
- **Styling**: Tailwind CSS with Shadcn UI (Radix primitives).
- **Animations**: Framer Motion & tailwindcss-animate.
- **Icons**: Lucide React.
- **State Management**: React Context API (`AuthContext`, `CartContext`, `WishlistContext`). No Redux/Zustand.

---

## 2. Directory Structure (`src/`)

- `Pages/`: All routing views. Some feature-specific subfolders exist (e.g., `Profile/`).
- `components/`: 
  - `layout/`: Global layout components (`Header.jsx`, `Footer.jsx`).
  - `product/`: Domain-specific components (`ProductCard.jsx`).
  - `shared/`: Empty. **Needs population** to reduce page-level code duplication.
  - `ui/`: Auto-generated Shadcn UI components.
- `context/`: Global state providers using `localStorage` for persistence.
- `data/`: Hardcoded JSON data (`cakesData.js`) serving as a mock database.
- `hooks/`: Custom React hooks (e.g., `use-mobile.jsx`).
- `lib/`: Utility functions (primarily `utils.js` for `clsx` and `tailwind-merge`).

---

## 3. Routing Flow & Page Status

Managed in `App.jsx`. All routes currently render publicly (no authentication guards).

| Route | Component | Purpose | Status |
| :--- | :--- | :--- | :--- |
| `/` | `Home.jsx` | Landing page. Hero slides, categories, best sellers. | Mostly Complete (16KB) |
| `/shop` | `Shop.jsx` | Product listing page with filters. | Mostly Complete |
| `/cake/:id` | `CakeDetails.jsx` | Heavy PDP. Customizations (eggless, text, photo upload), variants, delivery slot. | Mostly Complete (23KB) |
| `/cart` | `Cart.jsx` | Shopping cart review and coupon application. | Complete |
| `/checkout` | `Checkout.jsx` | Multi-step form for shipping address and simulated payment (Card/COD). | Complete (UI only) |
| `/track-order` | `TrackOrder.jsx` | Order tracking timeline. | UI built |
| `/offers` | `Offers.jsx` | Promotional page. | UI built |
| `/login`, `/signup`, `/forgot-password` | `Login.jsx`, etc. | Authentication forms. | UI built |
| `/profile` | `Profile/ProfilePanel.jsx` | User dashboard (Orders, Settings). | Complete (UI only) |
| `/*` | `NotFound.jsx` | 404 Fallback. | Complete |
| `/about`, `/contact`, `/career` | `About.jsx`, etc. | Static company information pages. | Built |

---

## 4. Components & Reusability (Duplicated Code)

**Current State**: 
The `components/shared` folder is completely empty. 
Developers have been building complex UI sections directly inside Page files.

**Identified Duplications / Refactoring Opportunities**:
1. **CakeDetails.jsx (23KB)**: 
   - The *Customization Forms* (Flavor, Weight, Add-ons, Delivery Schedule) are hardcoded in the page. They should be extracted into `components/product/CakeConfigurator.jsx`.
   - The *Image Gallery* should be extracted into `components/product/ProductGallery.jsx`.
2. **Checkout.jsx (17KB)**:
   - The *Shipping Form* and *Payment Form* are hardcoded. They should be isolated into `components/checkout/ShippingForm.jsx` and `PaymentForm.jsx`.
3. **Hero Sections**: Many pages use a similar "Title with a pink underline" header style. This should become a reusable `<SectionHeading />` in `components/shared`.

---

## 5. Contexts & State Management

State is tightly coupled with `localStorage` for persistence.

- **`AuthContext`**: Manages `user` state. Currently uses a `MOCK_USER` (Sarah Johnson) and simulated API delays (`setTimeout`). Needs conversion to JWT / actual backend.
- **`CartContext`**: Powerful context handling cart arrays, duplicate checking (based on flavor, weight, eggless, message), coupon logic (`VALID_COUPONS`), and price totals.
- **`WishlistContext`**: Simple array of `cakeId` strings to toggle heart icons.

**Custom Hooks exported:**
- `useAuth()`
- `useCart()`
- `useWishlist()`

---

## 6. Data Flow

**Current Data Flow**:
`cakesData.js` -> Imported locally into Pages (`Home`, `Shop`, `CakeDetails`) -> Passed down to Components (`ProductCard`).

**Target Data Flow**:
`React Query (or useEffect)` -> Calls `src/api/cakeService.js` -> API fetches from Backend -> Data stored in component state or context.

---

## 7. Technical Debt & Missing Features

### High Priority Tech Debt
1. **Lack of Type Safety**: The project uses JavaScript/JSX. Defining interfaces (e.g., via JSDoc or migrating to TypeScript) for `Cake`, `CartItem`, and `User` is critical before the app grows further.
2. **Hardcoded Mock Data**: `cakesData.js` is imported directly. We need an abstraction layer (API services) so swapping to a real backend doesn't break every page.
3. **Missing Route Guards**: `/checkout` and `/profile` are accessible to logged-out users. We need a `<ProtectedRoute>` wrapper in `App.jsx`.

### Missing Features
1. **Backend Integration**: Real Auth (JWT), Database (MongoDB/PostgreSQL) connection.
2. **Payment Gateway Integration**: Stripe or Razorpay integration in `Checkout.jsx`.
3. **Image Optimization**: Vite doesn't optimize images automatically like Next.js. We need lazy loading (`loading="lazy"`) and webp conversions for high-res cake images to improve load times.
4. **Code Splitting**: `App.jsx` imports all 15 pages synchronously. We must use `React.lazy()` to split chunks.

---

## 8. Priority-Based Roadmap

**Phase 1: Architecture Polish (Frontend Only)**
- [ ] Implement `React.lazy()` and `<Suspense>` in `App.jsx`.
- [ ] Create `<ProtectedRoute>` wrapper for `/profile` and `/checkout`.
- [ ] Refactor `CakeDetails.jsx` - Extract `ProductGallery` and `CakeConfigurator`.
- [ ] Extract `<SectionHeading>` to `components/shared/`.

**Phase 2: Service Layer & Preparation**
- [ ] Setup `axios` instance in `src/api/axiosClient.js`.
- [ ] Create `cakeService.js`, `authService.js`, `cartService.js` to simulate API calls (wrapping the mock data in Promises).
- [ ] Replace direct `cakesData.js` imports in pages with `cakeService` calls and `useEffect` loading states.

**Phase 3: Backend & Payments**
- [ ] Connect `AuthContext` to real login/signup endpoints.
- [ ] Integrate Stripe Elements into `Checkout.jsx`.
- [ ] Connect `CartContext` to a database cart table for cross-device persistence.
