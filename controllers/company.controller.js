const Company = require('../models/Company');
const cloudinary = require('../config/cloudinary');

const getCompanyProfile = async (req, res, next) => {
  try {
    let company = await Company.findOne({ where: { userId: req.tenantId } });
    
    // If no company exists yet, create a default one
    if (!company) {
      company = await Company.create({
        userId: req.tenantId,
        companyName: 'Boutique CRM Solutions',
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

const updateCompanyProfile = async (req, res, next) => {
  try {
    const { companyName, email, phone, address, taxId, website } = req.body;
    let company = await Company.findOne({ where: { userId: req.tenantId } });

    if (!company) {
      company = await Company.create({ userId: req.tenantId, companyName: companyName || 'Company Name' });
    }

    // Handle logo upload
    if (req.file) {
      if (company.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(company.cloudinaryId);
        } catch (err) {
          console.error('Cloudinary delete error:', err);
        }
      }
      company.logoUrl = req.file.path;
      company.cloudinaryId = req.file.filename;
    }

    company.companyName = companyName || company.companyName;
    company.email = email !== undefined ? email : company.email;
    company.phone = phone !== undefined ? phone : company.phone;
    company.address = address !== undefined ? address : company.address;
    company.taxId = taxId !== undefined ? taxId : company.taxId;
    company.website = website !== undefined ? website : company.website;

    await company.save();

    res.status(200).json({
      success: true,
      data: company,
      message: 'Company profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile
};
