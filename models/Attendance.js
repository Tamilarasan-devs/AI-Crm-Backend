const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Half-Day', 'Leave'),
    allowNull: false,
  },
  checkIn: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  checkOut: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Employees',
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
});

module.exports = Attendance;
