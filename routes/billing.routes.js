const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, updateDeliveryStatus } = require('../controllers/billing.controller');

router.post('/', createInvoice);
router.get('/', getInvoices);
router.patch('/:id/delivery-status', updateDeliveryStatus);

module.exports = router;
