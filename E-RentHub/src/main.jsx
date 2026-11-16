import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'remixicon/fonts/remixicon.css'
import App from './App.jsx'

// One-time platform reset: wipe legacy mock orders/users so sales start clean from order #1
const RESET_KEY = "erenthub_clean_slate_v3";
if (typeof window !== "undefined" && localStorage.getItem(RESET_KEY) !== "true") {
  localStorage.removeItem("erenthub_orders");
  localStorage.removeItem("erenthub_booked_ids");
  localStorage.removeItem("erenthub_cart");
  // Clean old cached session if non-standard user
  const savedUser = localStorage.getItem("erenthub_user");
  if (savedUser) {
    try {
      const u = JSON.parse(savedUser);
      const validEmails = [
        "chhithesh511@gmail.com",
        "balue.hithesh@gmail.com",
        "ch.n.v.s.hithesh@gmail.com"
      ];
      if (!validEmails.includes(u.email)) {
        localStorage.removeItem("erenthub_user");
        localStorage.removeItem("erenthub_token");
      }
    } catch (e) {
      localStorage.removeItem("erenthub_user");
    }
  }
  localStorage.setItem(RESET_KEY, "true");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

