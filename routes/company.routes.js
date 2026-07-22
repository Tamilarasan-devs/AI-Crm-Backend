const express = require('express');
const { getCompanyProfile, updateCompanyProfile } = require('../controllers/company.controller');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', getCompanyProfile);
router.put('/', upload.single('logo'), updateCompanyProfile);

module.exports = router;
