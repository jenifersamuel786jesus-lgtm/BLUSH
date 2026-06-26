const express = require('express');

const Order = require('../models/Order');
    const {
      sendMail,
      formatOrderText,
      formatOrderHtml
    } = require('../utils/mailer');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    if (!req.app.locals.dbConnected) {
      return res.status(503).json({ message: 'Database is not connected. Order was not saved.' });
    }

    const { details, items } = req.body;

    if (!details || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Delivery details and cart items are required' });
    }

    const cleanedItems = items.map((item) => ({
      product: {
        name: String(item.product?.name || '').trim(),
        price: String(item.product?.price || '').trim(),
        image: String(item.product?.image || '').trim()
      },
      quantity: Number(item.quantity)
    }));

    if (cleanedItems.some((item) => !item.product.name || !item.product.price || !item.product.image || item.quantity < 1)) {
      return res.status(400).json({ message: 'Cart contains invalid products' });
    }

    const orderPayload = {
      orderNumber: createOrderNumber(),
      details: {
        name: String(details.name || '').trim(),
        address: String(details.address || '').trim(),
        email: String(details.email || '').trim(),
        phone: String(details.phone || '').trim()
      },
      items: cleanedItems,
      total: cleanedItems.reduce((sum, item) => sum + priceValue(item.product.price) * item.quantity, 0),
      deliveryWindow: generateDeliveryWindow()
    };

    if (!orderPayload.details.name || !orderPayload.details.address || !orderPayload.details.email || !orderPayload.details.phone) {
      return res.status(400).json({ message: 'All delivery details are required' });
    }

    const order = await Order.create(orderPayload);

    const emailStatus = await sendOrderConfirmation(order);

    return res.status(201).json({
      id: order.orderNumber,
      details: order.details,
      items: order.items,
      total: order.total,
      deliveryWindow: order.deliveryWindow,
      placedAt: order.createdAt,
      email: emailStatus
    });
  } catch (error) {
    return next(error);
  }
});

function priceValue(price) {
  return Number(String(price).replace(/\D/g, '')) || 0;
}

function generateDeliveryWindow() {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);

  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(deliveryDate);

  return `${date}, 10:00 AM - 2:00 PM`;
}

function createOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `BG-${timestamp}-${random}`;
}

async function sendOrderConfirmation(order) {
  try {
    const status = await sendMail({
      to: order.details.email,
      subject: `We received your Blush & Glow order ${order.orderNumber}`,
      text: formatOrderText(order),
      html: formatOrderHtml(order)
    });

    if (!status.sent) {
      console.warn(`Order confirmation email skipped for ${order.orderNumber}: ${status.reason}`);
    }

    return status;
  } catch (error) {
    console.warn(`Order confirmation email failed for ${order.orderNumber}: ${error.message}`);
    return { sent: false, reason: error.message };
  }
}

module.exports = router;
