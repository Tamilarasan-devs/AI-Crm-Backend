const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct, getTrashedProducts, restoreProduct, forceDeleteProduct, emptyProductTrash } = require('../controllers/product.controller');
const upload = require('../middlewares/upload');

// Use multer middleware for parsing multipart/form-data and uploading image to cloudinary
router.post('/', upload.array('images', 5), createProduct);
router.get('/', getProducts);
router.get('/trash', getTrashedProducts);
router.patch('/:id/restore', restoreProduct);
router.put('/:id', upload.array('images', 5), updateProduct);
router.delete('/trash/empty', emptyProductTrash);
router.delete('/:id/force', forceDeleteProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
