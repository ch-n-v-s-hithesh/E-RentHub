import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RentHub from "../assets/RentHub-original.png";
import "./Register.css";

function Register() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("+91 73963 48793");
    const [address, setAddress] = useState("Powerpet Main Road, Eluru - 534002");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("customer"); // 'customer', 'delivery'
    const [agreed, setAgreed] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleRegister(event) {
        event.preventDefault();
        setErrorMsg("");

        if (!fullName.trim()) {
            setErrorMsg("Please enter your full name.");
            return;
        }

        if (!email.trim() || !email.includes("@")) {
            setErrorMsg("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match. Please re-enter.");
            return;
        }

        if (!agreed) {
            setErrorMsg("Please accept the community rental guidelines to continue.");
            return;
        }

        setIsLoading(true);
        const normalizedRole = role === "delivery" ? "delivery" : "customer";
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = fullName.trim();
        const cleanPhone = phone.trim() || "+91 73963 48793";
        const cleanAddress = address.trim() || "Powerpet Main Road, Eluru - 534002";

        const nameParts = cleanName.split(" ");
        const firstName = nameParts[0] || cleanName;
        const lastName = nameParts.slice(1).join(" ") || "";

        const profileData = {
            name: cleanName,
            firstName,
            lastName,
            email: cleanEmail,
            phone: cleanPhone,
            address: cleanAddress,
            city: "Eluru",
            stateName: "Andhra Pradesh",
            pincode: "534002",
            role: normalizedRole,
            hub: normalizedRole === "delivery" ? "Eluru Powerpet Hub" : "Eluru Central Hub",
            assignedVehicle: normalizedRole === "delivery" ? "EV Scooter (AP-37)" : undefined,
        };

        const userData = {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            role: normalizedRole,
            city: "Eluru",
            address: cleanAddress,
        };

        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone,
                    address: cleanAddress,
                    password: password.trim(),
                    role: normalizedRole,
                    city: "Eluru",
                }),
            });
            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem("erenthub_token", data.token);
            }
        } catch (err) {
            console.log("Offline registration cache fallback");
        } finally {
            setIsLoading(false);
        }

        // Immediately update localStorage with registered user's profile
        localStorage.setItem("erenthub_user_role", normalizedRole);
        localStorage.setItem("erenthub_user", JSON.stringify(userData));
        localStorage.setItem("erenthub_user_profile", JSON.stringify(profileData));

        if (normalizedRole === "delivery") {
            navigate("/delivery");
        } else {
            navigate("/home");
        }
    }

    return (
        <div className="register-form">
            <div className="left">
                <div className="left-center-wrap">
                    <div className="left-brand-card">
                        <img src={RentHub} alt="E-RentHub Logo" className="left-logo-img" />
                    </div>

                    <div className="left-content">
                        <h2>
                            Join <span>E-RentHub</span>
                        </h2>

                        <p className="left-desc">
                            Rent cameras, projectors, sound systems, and laptops with zero advance and convenient doorstep delivery right here in Eluru.
                        </p>
                    </div>
                </div>

                <div className="left-footer-quote">
                    <i className="ri-map-pin-line"></i> Powerpet Main Road, Eluru • Verified Rental Platform
                </div>
            </div>

            <div className="right">
                <div className="head">
                    <h1>Create your <span>Account</span></h1>
                    <h5>Enter your details below to start renting or delivering in Eluru</h5>
                </div>

                {errorMsg && (
                    <div className="register-error-banner" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
                        <i className="ri-error-warning-line" style={{ marginRight: "6px" }}></i>
                        {errorMsg}
                    </div>
                )}

                <form className="form" onSubmit={handleRegister}>
                    {/* Role Selection: Customer or Delivery Partner */}
                    <div className="register-role-section">
                        <label className="register-role-label">I want to join as:*</label>
                        <div className="register-role-options-2">
                            <button
                                type="button"
                                className={`register-role-card ${role === "customer" ? "active" : ""}`}
                                onClick={() => { setRole("customer"); setErrorMsg(""); }}
                            >
                                <div className="role-card-header">
                                    <span className="role-icon"><i className="ri-user-3-line"></i></span>
                                    <span className="role-radio"><span className="role-radio-inner"></span></span>
                                </div>
                                <div className="role-title">Customer</div>
                                <div className="role-desc">Rent gadgets with doorstep delivery</div>
                            </button>

                            <button
                                type="button"
                                className={`register-role-card ${role === "delivery" ? "active" : ""}`}
                                onClick={() => { setRole("delivery"); setErrorMsg(""); }}
                            >
                                <div className="role-card-header">
                                    <span className="role-icon"><i className="ri-truck-line"></i></span>
                                    <span className="role-radio"><span className="role-radio-inner"></span></span>
                                </div>
                                <div className="role-title">Delivery Partner</div>
                                <div className="role-desc">Pick up and deliver gadgets</div>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullname">Full Name*</label>
                        <input
                            type="text"
                            id="fullname"
                            placeholder="e.g. Subba Rao Chaluvadi"
                            value={fullName}
                            onChange={(e) => { setFullName(e.target.value); setErrorMsg(""); }}
                            required
                        />
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label htmlFor="register-email">Email Address*</label>
                            <input
                                type="email"
                                id="register-email"
                                placeholder="e.g. yourname@gmail.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="register-phone">Mobile Number*</label>
                            <input
                                type="text"
                                id="register-phone"
                                placeholder="+91 73963 48793"
                                value={phone}
                                onChange={(e) => { setPhone(e.target.value); setErrorMsg(""); }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-address">Delivery / Home Address (Eluru)*</label>
                        <input
                            type="text"
                            id="register-address"
                            placeholder="e.g. Flat 302, Sri Sai Residency, Powerpet, Eluru - 534002"
                            value={address}
                            onChange={(e) => { setAddress(e.target.value); setErrorMsg(""); }}
                            required
                        />
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label htmlFor="register-password">Password*</label>
                            <input
                                type="password"
                                id="register-password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password*</label>
                            <input
                                type="password"
                                id="confirm-password"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(""); }}
                                required
                            />
                        </div>
                    </div>

                    <div className="line">
                        <div className="leftitem">
                            <input
                                className="check"
                                type="checkbox"
                                id="terms"
                                checked={agreed}
                                onChange={(e) => { setAgreed(e.target.checked); setErrorMsg(""); }}
                                required
                            />
                            <label htmlFor="terms">
                                I agree to the{" "}
                                <span
                                    className="terms-link"
                                    onClick={() => alert("E-RentHub Terms: Genuine devices, flexible day-wise rentals, verified local community, and safe return guarantee.")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Terms & Rental Guidelines
                                </span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="register-submit-btn" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account →"}
                    </button>

                    <div className="auth-separator">
                        <span>or</span>
                    </div>

                    <p className="login-switch-text">
                        Already have an account?{" "}
                        <span onClick={() => navigate("/")} className="login-switch-link">
                            Log in
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
