import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./PrivacyPolicy.css";

export default function TermsAndConditions() {
    const navigate = useNavigate();

    return (
        <div className="policy-page">
            <header className="policy-header">
                <div className="policy-header-inner">
                    <Link to="/home" className="policy-brand">
                        <img src={logo} alt="E-RentHub" className="policy-logo" />
                        <span className="policy-brand-text">E-Rent<span>Hub</span></span>
                    </Link>
                    <div className="policy-nav-actions">
                        <button type="button" className="policy-back-btn" onClick={() => navigate(-1)}>
                            <i className="ri-arrow-left-line"></i>
                            <span>Back</span>
                        </button>
                        <Link to="/home" className="policy-home-link">Home</Link>
                        <Link to="/privacy" className="policy-link">Privacy Policy</Link>
                    </div>
                </div>
            </header>

            <main className="policy-container">
                <div className="policy-card">
                    <div className="policy-hero">
                        <span className="policy-badge">Customer Agreement</span>
                        <h1>Terms and Conditions</h1>
                        <p className="policy-updated">Last Updated: November 8, 2026 • Effective Date: November 8, 2026</p>
                    </div>

                    <div className="policy-content">
                        <section className="policy-section">
                            <h2>1. Agreement to Terms</h2>
                            <p>
                                These Terms and Conditions constitute a legally binding agreement made between you ("Customer," "User," or "Renter") and <strong>E-RentHub</strong>, governing your access to and use of our electronic equipment rental catalog, doorstep logistics network, and platform services in Eluru, Andhra Pradesh.
                            </p>
                            <p>
                                By placing an order, booking equipment, or creating an account, you acknowledge that you have read, understood, and agreed to be bound by all of these terms.
                            </p>
                        </section>

                        <section className="policy-section">
                            <h2>2. Equipment Rental & Booking Policies</h2>
                            <ul>
                                <li><strong>Tenure & Tariff:</strong> Equipment is leased on a per-day or weekly basis as specified during checkout. Total payable fees include daily rental charges and applicable GST (18%).</li>
                                <li><strong>Cash on Delivery (COD):</strong> Unless explicitly paid via digital advance, rental tariffs and applicable deposits are collected in cash or verified instant UPI upon doorstep handover.</li>
                                <li><strong>Device Availability:</strong> While we maintain live catalog tracking, bookings remain subject to physical hardware verification and battery/power testing prior to dispatch.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2>3. Doorstep Delivery & PIN Verification</h2>
                            <ul>
                                <li><strong>Location Coordinates:</strong> Delivery is executed to the exact address and location coordinates confirmed via the Delivery Map Picker.</li>
                                <li><strong>Doorstep PIN Handover:</strong> For security and asset chain-of-custody, equipment is released only upon the customer providing the verified 4-digit Delivery PIN generated for the order or validating identity.</li>
                                <li><strong>Initial Inspection:</strong> Customers are advised to test the gadget, verify battery health, and inspect for existing cosmetic blemishes in the presence of the delivery executive before providing the handover PIN.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2>4. Customer Responsibilities & Equipment Care</h2>
                            <p>During the rental tenure, the customer assumes full custodial responsibility for the equipment:</p>
                            <ul>
                                <li>Equipment must be used strictly for lawful personal or business tasks and in accordance with manufacturer operating instructions.</li>
                                <li>The renter shall not attempt internal disassembly, hardware modifications, or BIOS/firmware alteration.</li>
                                <li>In the event of accidental damage, liquid spillage, or physical breakage, the renter must notify E-RentHub support immediately. Repair or component replacement costs will be assessed based on authorized service center estimates.</li>
                                <li>In case of complete loss or theft, the renter remains liable for the depreciated replacement value of the specific model.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2>5. Return, Pickup & Tenure Extensions</h2>
                            <ul>
                                <li><strong>Scheduled Return:</strong> On the final day of the rental tenure, our assigned delivery partner will arrive at the registered address for collection and return testing.</li>
                                <li><strong>Extensions:</strong> If you wish to extend the rental tenure, you must submit an extension request via your Orders portal at least 6 hours prior to the scheduled return time.</li>
                                <li><strong>Late Fees:</strong> Unnotified delays exceeding 12 hours past the agreed return window may incur a standard daily tariff penalty.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2>6. Cancellations & Refunds</h2>
                            <p>
                                Orders may be cancelled free of charge at any time prior to dispatch from our local hub. Once the delivery partner has departed on the local route, a nominal transit fee may apply if cancelled at the doorstep without valid hardware fault.
                            </p>
                        </section>

                        <section className="policy-section">
                            <h2>7. Governing Law & Dispute Resolution</h2>
                            <p>
                                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or claim arising out of or in connection with rentals executed on E-RentHub shall be subject to the exclusive jurisdiction of the competent courts in <strong>Eluru, Andhra Pradesh</strong>.
                            </p>
                        </section>

                        <section className="policy-section">
                            <h2>8. Support & Assistance</h2>
                            <div className="policy-contact-box">
                                <p><strong>E-RentHub Customer Care Desk</strong></p>
                                <p>Email: <a href="mailto:support@erenthub.in">support@erenthub.in</a> / <a href="mailto:chhithesh511@gmail.com">chhithesh511@gmail.com</a></p>
                                <p>Support Helpline: +91 94943 21511</p>
                                <p>Operational Base: Main Road, Eluru, Andhra Pradesh 534001, India</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="policy-footer">
                <div className="policy-footer-inner">
                    <p>© 2026 E-RentHub. All rights reserved. Local Equipment & Gadget Rentals.</p>
                    <div className="policy-footer-links">
                        <Link to="/home">Home</Link>
                        <span>•</span>
                        <Link to="/terms">Terms & Conditions</Link>
                        <span>•</span>
                        <Link to="/privacy">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

