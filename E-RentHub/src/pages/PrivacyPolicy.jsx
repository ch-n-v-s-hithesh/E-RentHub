import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
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
                        <Link to="/terms" className="policy-link">Terms & Conditions</Link>
                    </div>
                </div>
            </header>

            <main className="policy-container">
                <div className="policy-card">
                    <div className="policy-hero">
                        <span className="policy-badge">Legal Documentation</span>
                        <h1>Privacy Policy</h1>
                        <p className="policy-updated">Last Updated: November 8, 2026 • Effective Date: November 8, 2026</p>
                    </div>

                    <div className="policy-content">
                        <section className="policy-section">
                            <h2>1. Introduction</h2>
                            <p>
                                Welcome to <strong>E-RentHub</strong> ("we," "our," or "us"). We operate a localized peer-to-peer and managed electronic equipment rental platform serving Eluru and surrounding regions. We respect your privacy and are committed to protecting your personal data in accordance with applicable data privacy regulations, including the Digital Personal Data Protection Act (DPDP), 2023.
                            </p>
                            <p>
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access or use our website, mobile interface, or local rental and delivery services.
                            </p>
                        </section>

                        <section className="policy-section">
                            <h2>2. Information We Collect</h2>
                            <p>We collect information that you directly provide when registering an account, booking equipment, placing rental requests, or coordinating doorstep deliveries:</p>
                            <ul>
                                <li><strong>Identity & Contact Details:</strong> Full name, registered email address, phone number, and account credentials.</li>
                                <li><strong>Delivery & Location Information:</strong> Physical street address, landmark, city, postal code, and precise geographic coordinates (latitude and longitude) selected via our interactive Delivery Map Picker.</li>
                                <li><strong>Transaction & Order Details:</strong> Rental duration, equipment specifications, tariff breakdowns, security deposits, and Cash on Delivery / UPI transaction status.</li>
                                <li><strong>Verification & Security Information:</strong> Doorstep verification PINs, pickup confirmation codes, and equipment inspection condition logs.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2>3. How We Use Your Information</h2>
                            <p>We process your personal information strictly for legitimate business and fulfillment purposes:</p>
                            <ul>
                                <li>Facilitating doorstep equipment delivery and collection routes by verified delivery partners.</li>
                                <li>Transmitting order confirmations, delivery PINs, return reminders, and invoices to your registered email.</li>
                                <li>Preventing fraudulent bookings and securing rented equipment assets.</li>
                                <li>Calculating accurate localized delivery fees and equipment availability based on designated hub areas.</li>
                                <li>Responding to customer support inquiries and resolving maintenance requests.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2>4. Delivery Partner & Location Data Sharing</h2>
                            <p>
                                When an order is placed, assigned delivery partners receive only the operational data necessary to execute pickup and doorstep handover: customer name, contact phone number, destination address, and GPS pin on the delivery map. Delivery partners are bound by strict non-disclosure obligations and are prohibited from retaining or using your contact information outside the scope of the active delivery route.
                            </p>
                            <p>
                                <strong>We never sell, rent, or trade your personal data, location history, or rental habits to any third-party advertisers or data brokers.</strong>
                            </p>
                        </section>

                        <section className="policy-section">
                            <h2>5. Data Security & Storage</h2>
                            <p>
                                We employ industry-standard administrative, technical, and physical safeguards to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All data transmission is encrypted using Secure Sockets Layer (SSL/TLS) protocols. Backend records are housed in secured MongoDB database clusters with authenticated role-based access controls.
                            </p>
                        </section>

                        <section className="policy-section">
                            <h2>6. Data Retention & User Rights</h2>
                            <p>
                                We retain personal information for as long as your account remains active or as required to fulfill legal, tax, and dispute resolution requirements. You have the right to:
                            </p>
                            <ul>
                                <li>Access and inspect the personal data associated with your profile.</li>
                                <li>Update or correct inaccurate contact details and delivery addresses.</li>
                                <li>Request account deactivation or deletion of personal rental records, subject to settled outstanding dues or active equipment tenures.</li>
                            </ul>
                        </section>

                        <section className="policy-section">
                            <h2>7. Contact Information</h2>
                            <p>
                                For questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact our Data Protection desk:
                            </p>
                            <div className="policy-contact-box">
                                <p><strong>E-RentHub Operations Desk</strong></p>
                                <p>Email: <a href="mailto:support@erenthub.in">support@erenthub.in</a> / <a href="mailto:chhithesh511@gmail.com">chhithesh511@gmail.com</a></p>
                                <p>Operational Hub: Eluru, Andhra Pradesh 534001, India</p>
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

