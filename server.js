require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Global Middlewares
app.use(helmet());
const corsOptions = {
  origin: [
    'https://ai-crm-frontend-sandy.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/api/v1/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'success', 
      message: 'API is running',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date()
    });
  }
});

const authRoutes = require('./routes/auth.routes');
const leadRoutes = require('./routes/lead.routes');
const productRoutes = require('./routes/product.routes');
const billingRoutes = require('./routes/billing.routes');
const followupRoutes = require('./routes/followup.routes');
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const companyRoutes = require('./routes/company.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const aiRoutes = require('./routes/ai.routes');
const copilotRoutes = require('./ai/routes/ai.routes');
const userRoutes = require('./routes/user.routes');

const { protect } = require('./middlewares/auth.middleware');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', protect, leadRoutes);
app.use('/api/v1/products', protect, productRoutes);
app.use('/api/v1/billing', protect, billingRoutes);
app.use('/api/v1/followups', protect, followupRoutes);
app.use('/api/v1/company', protect, companyRoutes);
app.use('/api/v1/dashboard', protect, dashboardRoutes);
app.use('/api/v1/ai', protect, aiRoutes);
app.use('/api/v1/copilot', protect, copilotRoutes);
app.use('/api/v1/employees', protect, employeeRoutes);
app.use('/api/v1/attendance', protect, attendanceRoutes);
app.use('/api/v1/users', protect, userRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Setup Associations
const Invoice = require('./models/Invoice');
const InvoiceItem = require('./models/InvoiceItem');
const Product = require('./models/Product');
const Lead = require('./models/Lead');
const FollowUp = require('./models/FollowUp');
const Company = require('./models/Company');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');

Invoice.hasMany(InvoiceItem, { onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice);
Product.hasMany(InvoiceItem, { onDelete: 'SET NULL' });
InvoiceItem.belongsTo(Product);

Lead.hasMany(FollowUp, { onDelete: 'CASCADE' });
FollowUp.belongsTo(Lead);

User.hasMany(Lead, { foreignKey: 'userId', onDelete: 'CASCADE' });
Lead.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Product, { foreignKey: 'userId', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Invoice, { foreignKey: 'userId', onDelete: 'CASCADE' });
Invoice.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Company, { foreignKey: 'userId', onDelete: 'CASCADE' });
Company.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Employee, { foreignKey: 'userId', onDelete: 'CASCADE' });
Employee.belongsTo(User, { foreignKey: 'userId' });

Employee.hasMany(Attendance, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

User.hasMany(Attendance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

// Database Sync & Server Start
sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL Connection has been established successfully.');
    // Note: Use { alter: true } in dev for auto-schema updates
    return sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });



  