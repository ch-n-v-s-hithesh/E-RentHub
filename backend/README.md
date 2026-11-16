# E-RentHub Backend & MongoDB Compass Setup

This backend connects the **E-RentHub** frontend with **MongoDB Compass**.

---

## 1. Connecting MongoDB Compass

1. Open **MongoDB Compass** on your desktop.
2. In the connection string field, paste:
   ```
   mongodb://127.0.0.1:27017
   ```
   *(or `mongodb://localhost:27017`)*
3. Click **Connect**.
4. You will see the database named **`erenthub`** with three collections:
   - **`users`**: Contains seeded Admin, Customer, and Delivery accounts.
   - **`products`**: Equipment inventory (Projectors, Cameras, Sound Boxes, Laptops).
   - **`orders`**: Active and completed rental bookings with assigned delivery tracking.

---

## 2. Seeded Account Credentials

| Role | Email ID | Password | Permitted Views |
| :--- | :--- | :--- | :--- |
| **Admin** | `chhithesh511@gmail.com` | `Ch.N.V.S.Hithesh@511` | Admin Dashboard (`/admin`) + Customer Store (`/home`) |
| **Customer** | `balue.hithesh@gmail.com` | `Chhithesh@511` | Home (`/home`), Orders (`/orders`), Sales Portal (`/sales`), Profile (`/profile`) |
| **Delivery** | `ch.n.v.s.hithesh@gmail.com` | `Chhithesh@511` | Delivery Page (`/delivery`) with personal income & assigned orders |

---

## 3. How to Run the Backend Server

From the `E-RentHub` folder, run:
```bash
npm run server
```
Server runs on: **`http://localhost:5000`**

To run seed independently:
```bash
node backend/seed.js
```

