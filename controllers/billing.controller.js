const sequelize = require('../config/database');
const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Product = require('../models/Product');
const { ApiError, ApiResponse } = require('../utils/apiResponse');

const createInvoice = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { customerName, customerEmail, customerPhone, items, subtotal, tax, discount, total, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      throw new ApiError(400, 'Invoice must have at least one item');
    }

    // Generate Invoice Number
    const invoiceCount = await Invoice.count({ where: { userId: req.tenantId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      userId: req.tenantId
    }, { transaction });

    for (const item of items) {
      const product = await Product.findOne({ where: { id: item.productId, userId: req.tenantId }, transaction });
      
      if (!product) {
        throw new ApiError(404, `Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product ${product.name}`);
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ transaction });

      // Create Invoice Item
      await InvoiceItem.create({
        InvoiceId: invoice.id,
        ProductId: product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }, { transaction });
    }

    await transaction.commit();
    
    // Fetch the created invoice with items
    const createdInvoice = await Invoice.findOne({
      where: { id: invoice.id, userId: req.tenantId },
      include: [
        { model: InvoiceItem, include: [Product] }
      ]
    });

    res.status(201).json(new ApiResponse(201, createdInvoice, 'Invoice created successfully'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.findAll({
      where: { userId: req.tenantId },
      order: [['createdAt', 'DESC']],
      include: [
        { model: InvoiceItem, include: [Product] }
      ]
    });
    res.status(200).json(new ApiResponse(200, invoices, 'Invoices fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;
    
    const invoice = await Invoice.findOne({ where: { id, userId: req.tenantId } });
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    invoice.deliveryStatus = deliveryStatus;
    await invoice.save();

    res.status(200).json(new ApiResponse(200, invoice, 'Delivery status updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  updateDeliveryStatus
};
