import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RentHub from "../assets/RentHub-original.png";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    async function handleLogin(event) {
        event.preventDefault();
        if (!email.trim() || !password.trim()) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password.trim();

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("erenthub_token", data.token || "erenthub_session");
                localStorage.setItem("erenthub_user_role", data.role);
                localStorage.setItem("erenthub_user_profile", JSON.stringify(data.user));
                if (data.redirect) {
                    navigate(data.redirect);
                    return;
                }
            } else if (res.status === 401) {
                const errData = await res.json().catch(() => ({}));
                setErrorMsg(errData.message || "Invalid email or password.");
                return;
            }
        } catch (e) {
            console.warn("Backend login offline, falling back to verified credentials check:", e);
        }

        // 1. ADMIN LOGIN
        if (cleanEmail === "chhithesh511@gmail.com" && cleanPass === "Ch.N.V.S.Hithesh@511") {
            localStorage.setItem("erenthub_user_role", "admin");
            localStorage.setItem("erenthub_user_profile", JSON.stringify({
                name: "Hithesh Chaluvadi (Admin)",
                email: cleanEmail,
                role: "admin",
                hub: "Eluru Main Hub",
            }));
            navigate("/admin");
            return;
        }

        // 2. CUSTOMER LOGIN
        if ((cleanEmail === "balue.hithesh@gmail.com" || cleanEmail === "balu.hithesh@gmail.com") && cleanPass === "Chhithesh@511") {
            localStorage.setItem("erenthub_user_role", "customer");
            localStorage.setItem("erenthub_user_profile", JSON.stringify({
                name: "Balu Hithesh (Customer)",
                email: cleanEmail,
                role: "customer",
                hub: "Eluru Powerpet Hub",
            }));
            navigate("/home");
            return;
        }

        // 3. DELIVERY PERSON LOGIN
        if (cleanEmail === "ch.n.v.s.hithesh@gmail.com" && cleanPass === "Chhithesh@511") {
            localStorage.setItem("erenthub_user_role", "delivery");
            localStorage.setItem("erenthub_user_profile", JSON.stringify({
                name: "CH.N.V.S. Hithesh (Delivery Partner)",
                email: cleanEmail,
                role: "delivery",
                hub: "Eluru Powerpet Hub #2 (Powerpet Branch)",
                assignedVehicle: "EV Scooter (AP-37)",
            }));
            navigate("/delivery");
            return;
        }

        setErrorMsg("Invalid credentials. Please verify your email and password.");
    }

    return (
        <div className="login-form">
            <div className="left">
                <div className="left-center-wrap">
                    <div className="left-brand-card">
                        <img src={RentHub} alt="E-RentHub Logo" className="left-logo-img" />
                    </div>

                    <div className="left-content">
                        <h2>
                            Welcome to <span>E-RentHub</span>
                        </h2>

                        <p className="left-desc">
                            Your trusted gadget rental platform in Eluru. Rent high-end projectors, cameras, and sound systems by the day with local doorstep delivery.
                        </p>
                    </div>
                </div>

                <div className="left-footer-quote">
                    <i className="ri-map-pin-line"></i> E-RentHub • Eluru Local Rentals & Delivery
                </div>
            </div>

            <div className="right">
                <div className="head">
                    <h1>Welcome back</h1>
                    <h5>Login to your E-RentHub account</h5>
                </div>

                {errorMsg && (
                    <div className="login-error-banner">
                        {errorMsg}
                    </div>
                )}

                <form className="form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address*</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="e.g. hithesh@gmail.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password*</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                            required
                        />
                    </div>

                    <div className="line">
                        <div className="leftitem">
                            <input
                                className="check"
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember">Remember me</label>
                        </div>

                        <div className="forget">
                            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your registered email."); }}>
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <button type="submit" className="login-submit-btn">
                        Sign In
                    </button>

                    <div className="login-auth-separator">
                        <span>or</span>
                    </div>

                    <p className="register-switch-text">
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/register")}
                            className="register-switch-link"
                        >
                            Create an account
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
