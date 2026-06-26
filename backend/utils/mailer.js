let transport;

function getTransport() {
  if (transport) {
    return transport;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    return null;
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (_error) {
    console.warn('Email disabled: install nodemailer with `npm install nodemailer`.');
    return null;
  }

  transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transport;
}

async function sendMail({ to, subject, text, html }) {
  const mailTransport = getTransport();

  if (!mailTransport) {
    return { sent: false, reason: 'SMTP settings are not configured' };
  }

  await mailTransport.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html
  });

  return { sent: true };
}

function formatOrderText(order) {
  const lines = order.items.map((item) => (
    `${item.product.name} x ${item.quantity} - ${item.product.price}`
  ));

  return [
    `Hi ${order.details.name},`,
    '',
    `We received your Blush & Glow order ${order.orderNumber}.`,
    '',
    'Order summary:',
    ...lines,
    `Total: Rs. ${order.total}`,
    `Estimated delivery: ${order.deliveryWindow}`,
    '',
    'Thank you for shopping with Blush & Glow.'
  ].join('\n');
}

function formatOrderHtml(order) {
  const rows = order.items.map((item) => (
    `<li>${escapeHtml(item.product.name)} x ${item.quantity} - ${escapeHtml(item.product.price)}</li>`
  )).join('');

  return `
    <p>Hi ${escapeHtml(order.details.name)},</p>
    <p>We received your Blush & Glow order <strong>${escapeHtml(order.orderNumber)}</strong>.</p>
    <ul>${rows}</ul>
    <p><strong>Total:</strong> Rs. ${order.total}</p>
    <p><strong>Estimated delivery:</strong> ${escapeHtml(order.deliveryWindow)}</p>
    <p>Thank you for shopping with Blush & Glow.</p>
  `;
}

function formatWelcomeText(email) {
  return [
    'Hi there,',
    '',
    'You have successfully subscribed to Blush & Glow.',
    '',
    `Subscribed email: ${email}`,
    '',
    'Welcome to our glow family. We will send you beauty tips, product news, and special offers from our company.'
  ].join('\n');
}

function formatWelcomeHtml(email) {
  return `
    <p>Hi there,</p>
    <p>You have successfully subscribed to <strong>Blush &amp; Glow</strong>.</p>
    <p><strong>Subscribed email:</strong> ${escapeHtml(email)}</p>
    <p>Welcome to our glow family. We will send you beauty tips, product news, and special offers from our company.</p>
  `;
}

function formatNewsletterHtml(message) {
  return `
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    <p>With glow,<br>Blush &amp; Glow</p>
  `;
}

function formatNewsletterText(message) {
  return [
    message,
    '',
    'With glow,',
    'Blush & Glow'
  ].join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  sendMail,
  formatOrderText,
  formatOrderHtml,
  formatWelcomeText,
  formatWelcomeHtml,
  formatNewsletterText,
  formatNewsletterHtml
};
