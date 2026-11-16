import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    transporter = {
      sendMail: async (options) => {
        console.log("--------------------------------------------------");
        console.log(`[EMAIL DISPATCH] To: ${options.to}`);
        console.log(`[EMAIL DISPATCH] Subject: ${options.subject}`);
        console.log("--------------------------------------------------");
        return { messageId: `local-sim-${Date.now()}` };
      },
    };
  }

  return transporter;
}

export async function sendSalespersonProductNoticeEmail({
  salespersonEmail = "sales.eluru@erenthub.in",
  salespersonName = "Partner / Sales Lister",
  customerName = "Customer",
  orderNumber,
  equipmentName,
  startDate,
  endDate,
  storeAddress = "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
}) {
  const mailer = getTransporter();
  const subject = `Action Required: Please Give Your Product in Store (Order ${orderNumber})`;

  const textContent = `
Hello ${salespersonName},

Your listed equipment "${equipmentName}" has just been booked by ${customerName}.

PLEASE GIVE YOUR PRODUCT IN STORE:
Store Location: ${storeAddress}
Rental Booking Dates: ${startDate} to ${endDate}
Store Hours: 9:00 AM – 9:00 PM (Monday – Sunday)
Helpline: +91 8812 234567

Please deliver your equipment to the store counter before ${startDate} so that our technician can verify its condition and prepare it for customer collection.

Thank you,
E-RentHub Store Operations
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .brand { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; }
    .brand span { color: #2563eb; }
    .action-badge { display: inline-block; background-color: #fef3c7; color: #92400e; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .notice-box { background-color: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .notice-title { font-size: 15px; font-weight: 700; color: #1d4ed8; margin-bottom: 6px; }
    .details { background-color: #f8fafc; border-radius: 6px; padding: 14px; margin: 18px 0; font-size: 13.5px; line-height: 1.6; }
    .footer { margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">E-Rent<span>Hub</span> • Sales & Inventory Partner</div>
    <div class="action-badge">Action Required • Store Drop-Off</div>
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 19px;">Your Product is Booked for Rental</h2>
    <p style="margin: 0 0 14px; font-size: 14px;">Hello <strong>${salespersonName}</strong>,</p>
    <p style="margin: 0 0 14px; font-size: 14px;">A customer has placed an order for your listed gadget: <strong>${equipmentName}</strong>.</p>

    <div class="notice-box">
      <div class="notice-title">Please Give Your Product in Store</div>
      <div style="font-size: 13.5px; color: #1e40af;">
        Kindly drop off your product at our Central Store Hub before <strong>${startDate}</strong> so our in-store technician can perform quality check and prepare it for customer collection.
      </div>
    </div>

    <div class="details">
      <div><strong>Order Number:</strong> ${orderNumber}</div>
      <div><strong>Equipment:</strong> ${equipmentName}</div>
      <div><strong>Customer:</strong> ${customerName}</div>
      <div><strong>Rental Window:</strong> ${startDate} to ${endDate}</div>
      <div><strong>Store Location:</strong> ${storeAddress}</div>
      <div><strong>Store Timings:</strong> 9:00 AM – 9:00 PM (Monday – Sunday)</div>
      <div><strong>Helpline:</strong> +91 8812 234567</div>
    </div>

    <div class="footer">
      E-RentHub Operations • Shop #4, Powerpet Main Road, Eluru • support@erenthub.in
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await mailer.sendMail({
      from: process.env.FROM_EMAIL || `"E-RentHub" <${process.env.SMTP_USER || "support@erenthub.in"}>`,
      to: salespersonEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });
    console.log(`[Sales Email Sent] Drop-off request delivered to ${salespersonEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Sales Email Error] Failed to send to ${salespersonEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendCustomerOrderOtpEmail({
  customerEmail,
  customerName = "Customer",
  orderNumber,
  equipmentName,
  otp,
  startDate,
  endDate,
  storeAddress = "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
  totalAmount = 496,
}) {
  const mailer = getTransporter();
  const subject = `Your E-RentHub Store Collection OTP: ${otp} (Order ${orderNumber})`;

  const textContent = `
Hello ${customerName},

Your booking ${orderNumber} for ${equipmentName} is confirmed!

PLEASE COLLECT YOUR PRODUCT FROM STORE STARTING ${startDate} TO ${endDate}.

Your 4-Digit Collection OTP is:
>>> ${otp} <<<

Store Address: ${storeAddress}
Store Hours: 9:00 AM – 9:00 PM (Monday – Sunday)
Amount to pay at store counter: ₹${totalAmount}
Helpline: +91 8812 234567

COLLECTION INSTRUCTIONS:
1. Visit our store hub between ${startDate} and ${endDate}.
2. Present this 4-digit Collection OTP and valid Govt ID at the counter.
3. Test your equipment with our technician, pay at the counter, and take your gadget!

Thank you,
E-RentHub Team
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .brand { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; }
    .brand span { color: #2563eb; }
    .otp-card { background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
    .otp-digits { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: monospace; }
    .instruction-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 13.5px; color: #166534; }
    .details { background-color: #f8fafc; border-radius: 6px; padding: 14px; margin: 18px 0; font-size: 13.5px; line-height: 1.6; }
    .footer { margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">E-Rent<span>Hub</span> • Order Confirmation</div>
    <h2 style="margin: 0 0 10px; color: #0f172a; font-size: 19px;">Your Store Collection OTP</h2>
    <p style="margin: 0 0 12px; font-size: 14px;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px; font-size: 14px;">Your order <strong>${orderNumber}</strong> for <strong>${equipmentName}</strong> is reserved and ready for store collection.</p>

    <div class="otp-card">
      <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Your 4-Digit Collection OTP (Sent to Mail Only)</div>
      <div class="otp-digits">${otp}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Show this OTP at the store counter to collect your equipment</div>
    </div>

    <div class="instruction-box">
      <strong>Please collect your product from store starting ${startDate} to ${endDate}.</strong><br>
      Store Location: ${storeAddress}<br>
      <em>Hours: 9:00 AM – 9:00 PM (Monday – Sunday) • Helpline: +91 8812 234567</em>
    </div>

    <div class="details">
      <div><strong>Rented Equipment:</strong> ${equipmentName}</div>
      <div><strong>Rental Window:</strong> ${startDate} to ${endDate}</div>
      <div><strong>Amount Payable at Counter:</strong> ₹${totalAmount} (₹0 advance paid)</div>
      <div><strong>Verification:</strong> 4-Digit OTP & Govt Photo ID required at store counter</div>
    </div>

    <div class="footer">
      E-RentHub Eluru • Shop #4, Powerpet Main Road • support@erenthub.in
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await mailer.sendMail({
      from: process.env.FROM_EMAIL || `"E-RentHub" <${process.env.SMTP_USER || "support@erenthub.in"}>`,
      to: customerEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });
    console.log(`[Customer OTP Email Sent] OTP delivered to ${customerEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Customer OTP Email Error] Failed to send to ${customerEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendRegistrationOtpEmail({ email, name = "User", otp }) {
  const mailer = getTransporter();
  const subject = `Your E-RentHub Registration OTP: ${otp}`;

  const textContent = `
Hello ${name},

Welcome to E-RentHub!

Your 6-digit email verification OTP is:
>>> ${otp} <<<

This code is valid for 10 minutes. Please enter this OTP on the registration page to verify your email and activate your account.

Thank you,
E-RentHub Team
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .brand { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; }
    .brand span { color: #2563eb; }
    .otp-card { background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
    .otp-digits { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: monospace; }
    .details { background-color: #f8fafc; border-radius: 6px; padding: 12px; margin: 16px 0; font-size: 13px; color: #475569; }
    .footer { margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">E-Rent<span>Hub</span> • Account Verification</div>
    <h2 style="margin: 0 0 10px; color: #0f172a; font-size: 19px;">Verify Your Email Address</h2>
    <p style="margin: 0 0 12px; font-size: 14px;">Hello <strong>${name}</strong>,</p>
    <p style="margin: 0 0 14px; font-size: 14px;">Thank you for registering with E-RentHub. Please verify your email using the one-time code below:</p>

    <div class="otp-card">
      <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Registration Verification Code</div>
      <div class="otp-digits">${otp}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Valid for 10 minutes</div>
    </div>

    <div class="details">
      If you did not initiate this registration, please disregard this email.
    </div>

    <div class="footer">
      E-RentHub Eluru • support@erenthub.in
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await mailer.sendMail({
      from: process.env.FROM_EMAIL || `"E-RentHub" <${process.env.SMTP_USER || "support@erenthub.in"}>`,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });
    console.log(`[Registration OTP Email Sent] OTP delivered to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Registration OTP Email Error] Failed to send to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendDestinationArrivalOtpEmail({
  customerEmail,
  customerName = "Customer",
  orderNumber,
  equipmentName,
  otp,
  totalAmount = 496,
}) {
  const mailer = getTransporter();
  const subject = `Delivery Executive Arrived • Your Verification Code: ${otp} (Order ${orderNumber})`;

  const textContent = `
Hello ${customerName},

Your E-RentHub Delivery Partner has arrived at your address with your equipment: "${equipmentName}".

PLEASE INSPECT YOUR GADGET CAREFULLY:
1. Check the physical condition, screen, power, and accessories with the delivery executive.
2. Once satisfied, share your 4-digit verification code:
   >>> ${otp} <<<
3. The delivery partner will enter this code to complete delivery and start your active rental.

Amount payable: ₹${totalAmount} (Cash / UPI on handover).

Thank you,
E-RentHub Delivery Operations
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .brand { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; }
    .brand span { color: #2563eb; }
    .badge { display: inline-block; background-color: #dbeafe; color: #1e40af; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .otp-card { background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
    .otp-digits { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: monospace; }
    .instruction-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 13.5px; color: #166534; line-height: 1.5; }
    .details { background-color: #f8fafc; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 13px; line-height: 1.6; color: #475569; }
    .footer { margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">E-Rent<span>Hub</span> • Doorstep Delivery</div>
    <div class="badge">Partner Arrived at Destination</div>
    <h2 style="margin: 0 0 10px; color: #0f172a; font-size: 19px;">Your Handover Verification Code</h2>
    <p style="margin: 0 0 12px; font-size: 14px;">Hello <strong>${customerName}</strong>,</p>
    <p style="margin: 0 0 14px; font-size: 14px;">Our delivery partner has reached your address with your reserved gadget: <strong>${equipmentName}</strong>.</p>

    <div class="instruction-box">
      <strong>Step 1: Inspect Your Gadget First!</strong><br>
      Please take a moment to inspect and test the device with the delivery executive.
    </div>

    <div class="otp-card">
      <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Your 4-Digit Handover Code</div>
      <div class="otp-digits">${otp}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">After checking the product, share this code with the delivery partner</div>
    </div>

    <div class="details">
      <div><strong>Order:</strong> #${String(orderNumber).replace("#", "")}</div>
      <div><strong>Product:</strong> ${equipmentName}</div>
      <div><strong>Payable Amount:</strong> ₹${totalAmount}</div>
    </div>

    <div class="footer">
      E-RentHub Operations • Support: +91 8812 234567 • support@erenthub.in
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await mailer.sendMail({
      from: process.env.FROM_EMAIL || `"E-RentHub" <${process.env.SMTP_USER || "support@erenthub.in"}>`,
      to: customerEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });
    console.log(`[Destination Arrival Email Sent] Handover OTP ${otp} delivered to ${customerEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Destination Arrival Email Error] Failed to send to ${customerEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendListerDepositOtpEmail({
  salespersonEmail = "sales.eluru@erenthub.in",
  salespersonName = "Equipment Owner",
  orderNumber,
  equipmentName,
  otp,
}) {
  const mailer = getTransporter();
  const subject = `Store Deposit Handover Code: ${otp} (Order ${orderNumber})`;

  const textContent = `
Hello ${salespersonName},

Your listed equipment "${equipmentName}" is being deposited into store inventory for Order #${String(orderNumber).replace("#", "")}.

PLEASE ALLOW STAFF TO VERIFY EQUIPMENT:
1. Store staff will inspect gadget condition, cables, and functionality.
2. Once verified, share your 4-digit deposit confirmation code:
   >>> ${otp} <<<
3. Staff will enter this code to confirm intake and secure your product in store.

Thank you,
E-RentHub Inventory Team
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .brand { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; }
    .brand span { color: #2563eb; }
    .badge { display: inline-block; background-color: #fef3c7; color: #92400e; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .otp-card { background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
    .otp-digits { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: monospace; }
    .details { background-color: #f8fafc; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 13px; line-height: 1.6; color: #475569; }
    .footer { margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">E-Rent<span>Hub</span> • Equipment Deposit</div>
    <div class="badge">Store Intake Verification</div>
    <h2 style="margin: 0 0 10px; color: #0f172a; font-size: 19px;">Your Equipment Deposit Code</h2>
    <p style="margin: 0 0 12px; font-size: 14px;">Hello <strong>${salespersonName}</strong>,</p>
    <p style="margin: 0 0 14px; font-size: 14px;">Your listed gadget <strong>${equipmentName}</strong> is being received at our store hub for booked rental Order #${String(orderNumber).replace("#", "")}.</p>

    <div class="otp-card">
      <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Your 4-Digit Deposit Code</div>
      <div class="otp-digits">${otp}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">After store staff verifies the product, share this code to confirm intake</div>
    </div>

    <div class="details">
      <div><strong>Order:</strong> #${String(orderNumber).replace("#", "")}</div>
      <div><strong>Product:</strong> ${equipmentName}</div>
      <div><strong>Status:</strong> Under Quality Inspection at Store Counter</div>
    </div>

    <div class="footer">
      E-RentHub Operations • Support: +91 8812 234567 • support@erenthub.in
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await mailer.sendMail({
      from: process.env.FROM_EMAIL || `"E-RentHub" <${process.env.SMTP_USER || "support@erenthub.in"}>`,
      to: salespersonEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });
    console.log(`[Lister Deposit Email Sent] Intake OTP ${otp} delivered to ${salespersonEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Lister Deposit Email Error] Failed to send to ${salespersonEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendOrderConfirmationEmail(params) {
  return sendCustomerOrderOtpEmail(params);
}

export async function sendDeliveryOtpEmail(params) {
  return sendCustomerOrderOtpEmail(params);
}
