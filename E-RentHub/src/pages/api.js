const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
            const data = await res.json();
            return data.products;
        }
    } catch (e) {
        console.warn("Backend API not reachable, using local catalog fallback:", e);
    }
    return null;
}

export async function createProduct(productData) {
    try {
        const res = await fetch(`${API_BASE}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("Backend product creation error, saving locally:", e);
    }
    return null;
}

export async function deleteProduct(productId) {
    try {
        const res = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("Backend product deletion error, updating locally:", e);
    }
    return null;
}

export async function fetchOrders() {
    try {
        const res = await fetch(`${API_BASE}/orders`);
        if (res.ok) {
            const data = await res.json();
            return data.orders;
        }
    } catch (e) {
        console.warn("Backend API not reachable, using local orders fallback:", e);
    }
    return null;
}

export async function createOrder(orderData) {
    try {
        const res = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("Backend order creation error, saving locally:", e);
    }
    return null;
}

export async function cancelOrder(orderId) {
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("Backend cancel order error, updating locally:", e);
    }
    return null;
}

export async function completeOrder(orderId) {
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/complete`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("Backend complete order error, updating locally:", e);
    }
    return null;
}

export async function returnOrder(orderId, returnData) {
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/return`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(returnData || {}),
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("Backend return order error, updating locally:", e);
    }
    return null;
}

export function getAuthHeader() {
    const token = localStorage.getItem("erenthub_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function resendOrderOtp(orderId, type = "delivery") {
    try {
        const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/resend-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ type }),
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("Backend resend OTP error:", e);
    }
    return null;
}

export async function fetchProfile() {
    try {
        const res = await fetch(`${API_BASE}/profile`);
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn("Backend profile fetch error:", e);
    }
    return null;
}
