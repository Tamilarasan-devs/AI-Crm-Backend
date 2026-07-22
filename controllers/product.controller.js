const Product = require('../models/Product');
const { ApiError, ApiResponse } = require('../utils/apiResponse');

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, price, stock } = req.body;
    let imageUrl = null;
    let imageUrls = [];
    let cloudinaryId = null;

    if (req.files && req.files.length > 0) {
      imageUrl = req.files[0].path;
      cloudinaryId = req.files[0].filename; // keep first id for backward compatibility
      imageUrls = req.files.map(f => f.path);
    }

    const existingProduct = await Product.findOne({
      where: {
        sku: req.body.sku,
        userId: req.tenantId
      }
    });
    if (existingProduct) {
      throw new ApiError(400, 'Product with this SKU already exists');
    }

    const product = await Product.create({
      name,
      sku,
      price,
      stock,
      imageUrl,
      imageUrls,
      cloudinaryId,
      userId: req.tenantId
    });

    res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { userId: req.tenantId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, products, 'Products fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock } = req.body;
    const product = await Product.findOne({ where: { id, userId: req.tenantId } });

    if (!product) throw new ApiError(404, 'Product not found');

    let existingImages = req.body.existingImages || [];
    if (typeof existingImages === 'string') {
      existingImages = [existingImages];
    }

    let newPaths = [];
    let newCloudinaryId = product.cloudinaryId;
    if (req.files && req.files.length > 0) {
      newPaths = req.files.map(f => f.path);
      newCloudinaryId = req.files[0].filename;
    }

    const combinedImages = [...existingImages, ...newPaths];
    
    product.imageUrls = combinedImages;
    product.imageUrl = combinedImages.length > 0 ? combinedImages[0] : null;
    product.cloudinaryId = newCloudinaryId;

    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.price = price || product.price;
    product.stock = stock || product.stock;

    await product.save();

    res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id, userId: req.tenantId } });
    if (!product) throw new ApiError(404, 'Product not found');
    
    // In a real app we might want to delete the image from Cloudinary here using product.cloudinaryId
    await product.destroy(); // Soft delete now

    res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const getTrashedProducts = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const products = await Product.findAll({
      paranoid: false,
      where: { userId: req.tenantId, deletedAt: { [Op.not]: null } },
      order: [['deletedAt', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, products, 'Trashed products fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const restoreProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id, userId: req.tenantId }, paranoid: false });
    if (!product) throw new ApiError(404, 'Product not found in trash');
    
    await product.restore();
    res.status(200).json(new ApiResponse(200, product, 'Product restored successfully'));
  } catch (error) {
    next(error);
  }
};

const forceDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id, userId: req.tenantId }, paranoid: false });
    if (!product) throw new ApiError(404, 'Product not found in trash');
    await product.destroy({ force: true });
    res.status(200).json(new ApiResponse(200, null, 'Product permanently deleted'));
  } catch (error) {
    next(error);
  }
};

const emptyProductTrash = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    await Product.destroy({
      where: {
        userId: req.tenantId,
        deletedAt: {
          [Op.not]: null
        }
      },
      force: true
    });
    res.status(200).json(new ApiResponse(200, null, 'Trash emptied successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getTrashedProducts,
  restoreProduct,
  forceDeleteProduct,
  emptyProductTrash
};
