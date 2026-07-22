const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unknown@example.com',
    validate: {
      isEmail: true,
      is: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|co|io|us|uk)$/i
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '0000000000',
    validate: {
      is: /^[0-9]{10}$/
    }
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unknown',
  },
  status: {
    type: DataTypes.ENUM('New', 'Contacted', 'Qualified', 'Won', 'Lost'),
    defaultValue: 'New',
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  paranoid: true,
});

module.exports = Lead;
