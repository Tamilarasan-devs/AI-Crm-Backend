const sequelize = require('./config/database');
const User = require('./models/User');

async function test() {
  await sequelize.authenticate();
  const users = await User.findAll({ raw: true });
  console.log("ALL USERS:", users.map(u => ({ id: u.id, email: u.email, role: u.role, tenantId: u.tenantId })));
}

test().catch(console.error).finally(() => process.exit());
