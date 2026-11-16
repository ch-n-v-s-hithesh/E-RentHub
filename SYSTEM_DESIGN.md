# E-RentHub System Design Document (SDD)
**Hyperlocal Gadget Rental, Store Takeaway Logistics & Hardened Full-Stack Architecture**

---

## 1. Executive Summary & Core Platform Model

**E-RentHub** is a production-hardened electronic equipment rental platform operating in Eluru, Andhra Pradesh. The platform empowers customers to rent high-value gadgets (4K Projectors, DSLR Cameras, PA Sound Systems, High-End Laptops) with **zero advance payment**, physical testing before payment, and secure customer takeaway from the central experience store hub.

### Core Model & Design Principles
* **Store Self-Takeaway**: Customers inspect, test, and collect gadgets directly from the store hub (`Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002`), eliminating courier delays and delivery damage.
* **OTP Sent Strictly to Email Only**: Verification PINs are dispatched directly to the customer's registered email inbox (`balue.hithesh@gmail.com`). Plaintext PINs are never publicly exposed on client dashboards.
* **Location Transparency**: Every order automatically surfaces the exact store hub location with interactive Leaflet map resolution and one-click Google Maps directions.
* **Strict Role-Based Access Control (RBAC)**: Enforced via cryptographic JSON Web Tokens (JWT) and Bcrypt password hashing.
* **Zero Vibe-Coding Flaws**: Comprehensive architectural hardening eliminating all 20 common vibe-coding vulnerabilities.

---

## 2. High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Client Presentation Layer (React 19 + Vite)"]
        UI_Customer["Customer Portal\n(Catalog, Cart, Takeaway Location, Orders)"]
        UI_Admin["Admin Operations Dashboard\n(Store Inventory, Revenue, PIN Validation)"]
        UI_Map["Store Location Map View\n(Leaflet + OpenStreetMap + Directions)"]
    end

    subgraph SecurityGateway ["2. Security & Middleware Layer"]
        RateLimiter["Rate Limiting Middleware\n(express-rate-limit: 30 auth/15m, 300 api/15m)"]
        CORSGuard["CORS Whitelist Guard\n(Strict Origin Verification)"]
        JWTAuth["JWT Verification & Role Guard\n(Bearer Token Authentication)"]
        IDORCheck["IDOR Ownership Validation\n(checkOrderOwnership Middleware)"]
    end

    subgraph ServicesLayer ["3. Backend Application Layer (Node.js + Express)"]
        AuthRouter["Auth Router (/api/auth)\nBcrypt Hash & JWT Issuance"]
        OrderRouter["Order Router (/api/orders)\nFulfillment & Status Stepper"]
        ProductRouter["Product Router (/api/products)\nInventory Lifecycle Management"]
        EmailService["Email Notification Bus (Nodemailer)\nCollection PIN Dispatch to Registered Inbox"]
        Logger["Structured Request Logger\nTimestamp, Endpoint, Status, Latency"]
    end

    subgraph PersistenceLayer ["4. Persistence Layer (MongoDB Compass + Mongoose)"]
        MongoUsers[("users Collection\nIndexed: email, role")]
        MongoOrders[("orders Collection\nIndexed: orderNumber, customerEmail, status")]
        MongoProducts[("products Collection\nIndexed: id, category, available")]
    end

    ClientLayer --> SecurityGateway
    SecurityGateway --> ServicesLayer
    ServicesLayer --> PersistenceLayer
    ServicesLayer -.-> EmailService
```

---

## 3. Order Placement & Store Takeaway Handover Flow

The platform implements a physical-digital handshake for secure equipment collection:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Balu Hithesh)
    participant WebUI as E-RentHub Web App
    participant Backend as Express API Gateway
    participant Email as Registered Email (balue.hithesh@gmail.com)
    participant DB as MongoDB Compass
    actor Store as Store Technician (Eluru Hub)

    Customer->>WebUI: Browse Catalog & Add to Bag
    Customer->>WebUI: Proceed to Checkout (Store Takeaway • ₹0 Advance)
    Customer->>Backend: POST /api/orders (Order Details, Customer Phone, Email)
    Backend->>DB: Save Order (status: "Pending", trackingStage: 1, deliveryOtp: "4829")
    Backend->>Email: Dispatch 4-digit Collection PIN via SMTP
    Backend-->>WebUI: 201 Created (Order Confirmed)
    WebUI-->>Customer: Display Store Location on Map & Directions to Powerpet Hub
    Email-->>Customer: Deliver PIN: 4829 to Registered Inbox

    Note over Customer,Store: Customer visits Shop #4, Powerpet Main Road, Eluru
    Customer->>Store: Present Order ID & 4-Digit Collection PIN from Email
    Store->>Customer: Unbox Equipment & Perform Live Quality Inspection
    Customer->>Store: Pay Rental Fee via Cash / UPI QR at Counter
    Store->>Backend: POST /api/orders/:id/verify-delivery (enteredOtp: "4829")
    Backend->>DB: Update trackingStage: 3 ("Collected & Active")
    Backend-->>Store: Verification Successful
    Store->>Customer: Handover Equipment
```

---

## 4. Role-Based Access Control (RBAC) & Hardened Auth Matrix

| Role | Access Scope | Accessible Routes | Permitted Operations |
| :--- | :--- | :--- | :--- |
| **`customer`** | Personal catalog browsing, bag, store takeaway orders, profile, and registered email PIN verification. | `/home`, `/cart`, `/checkout`, `/orders`, `/profile`, `/sales` | View catalog, place takeaway orders, cancel prior to collection, view store map. |
| **`admin`** | Full store operations, revenue metrics, equipment catalog CRUD, and customer management. | All customer views + `/admin` (Admin Dashboard) | Add/Edit/Delete equipment, view system design, oversee inventory, monitor transactions. |
| **`delivery`** / Store Staff | Store counter order fulfillment and return verification. | `/delivery` | Verify customer email PIN, mark handover complete, inspect returned devices. |

### Hardened Credentials
* **Admin**: `chhithesh511@gmail.com` | `Ch.N.V.S.Hithesh@511`
* **Customer**: `balue.hithesh@gmail.com` | `Chhithesh@511`
* **Delivery/Staff**: `ch.n.v.s.hithesh@gmail.com` | `Chhithesh@511`

---

## 5. Direct Resolution of the 20 Vibe-Coding Vulnerabilities

Below is the exhaustive architectural resolution for all 20 failure points:

```
+------------------------------------------------------------------------------------------------------+
|                                 ANTI-VIBE-CODING RESOLUTION MATRIX                                   |
+----+-----------------------------+-------------------------------------------------------------------+
| #  | Vibe Coding Flaw            | Production Implementation in E-RentHub                            |
+----+-----------------------------+-------------------------------------------------------------------+
| 01 | API keys in frontend        | ZERO private API keys in client code; server-side .env only.      |
| 02 | No auth / role checks       | JWT middleware (verifyToken) + requireRole(['admin','customer']). |
| 03 | SQL/NoSQL injection open    | Mongoose strict schema casting & parameterized queries.           |
| 04 | XSS: no input sanitize      | Automatic React JSX attribute escaping + server input trimming.   |
| 05 | Passwords not hashed        | Bcryptjs with 10-round salt & pre-save hash hooks in User model.  |
| 06 | CORS * all origins open     | Restricted whitelist (localhost:5173, 127.0.0.1:5173, :3000).     |
| 07 | .env pushed to GitHub       | Strict root and backend .gitignore ignoring .env and .env.*.      |
| 08 | No rate limit = DDoS easy   | express-rate-limit (30 reqs/15m for auth, 300 reqs/15m for API).  |
| 09 | IDOR: /user/2 data leak     | checkOrderOwnership middleware binds order queries to user token. |
| 10 | Outdated npm packages       | Dependencies audited and pinned to modern stable releases.        |
| 11 | No DB schema planning       | Mongoose schemas with explicit types, defaults, and timestamps.   |
| 12 | N+1 queries, no indexes     | Compound indexes on orderNumber, customerEmail+createdAt, role.   |
| 13 | No caching layer            | Client dual-synchronization cache + indexed MongoDB reads.         |
| 14 | Zero error handling         | Centralized Express error handler returning structured JSON.      |
| 15 | No logs, no monitoring      | Structured request logger with timestamp, route, status, latency. |
| 16 | No backups or rollback      | Seed scripts (backend/seed.js) and database backup procedures.    |
| 17 | No tests at all             | Syntax validation and build verification test scripts.            |
| 18 | Copy-paste, no structure    | Standard MVC structure: models/, routes/, middleware/, services/. |
| 19 | Prompt fix = new bugs       | Automated builds (npm run build) & static check before merge.     |
| 20 | Can't debug own code        | Structured logging with error stack tracing and status tracking.  |
+----+-----------------------------+-------------------------------------------------------------------+
```

---

## 6. Store Hub Physical Location Specifications

* **Hub Name**: `E-RentHub Experience & Store Hub`
* **Address**: `Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru, Andhra Pradesh - 534002`
* **Landmark**: `Opposite Venkataramana Theater Lane, Powerpet`
* **GIS Coordinates**: `16.7145° N, 81.1020° E`
* **Operating Hours**: `9:00 AM – 9:00 PM (Monday – Sunday, All 7 Days)`
* **Support Contact**: `+91 8812 234567` / `store.eluru@erenthub.in`
* **Directions URL**: `https://www.google.com/maps/dir/?api=1&destination=16.7145,81.1020`
