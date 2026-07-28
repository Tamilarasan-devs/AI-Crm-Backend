const sequelize = require('./config/database');
const User = require('./models/User');
const { Op } = require('sequelize');

async function fix() {
  await sequelize.authenticate();
  
  const adminUser = await User.findOne({ where: { role: 'Admin' } });
  
  if (adminUser) {
    console.log('Found Admin:', adminUser.email, adminUser.id);
    
    const [updatedRows] = await User.update(
      { tenantId: adminUser.id },
      { 
        where: { 
          role: { [Op.ne]: 'Admin' },
          tenantId: null 
        } 
      }
    );
    
    console.log(`Fixed ${updatedRows} sub-accounts to link to Admin.`);
  }
}

fix().catch(console.error).finally(() => process.exit());
