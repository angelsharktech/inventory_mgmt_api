const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const Firm = require('../models/Firm');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create a default firm if none exists
    let defaultFirm = await Firm.findOne({ name: 'Default Firm' });
    if (!defaultFirm) {
      defaultFirm = new Firm({ name: 'Default Firm' });
      await defaultFirm.save();
    }
    
    // Update all organizations with the default firm
    const result = await Organization.updateMany(
      { firm_id: { $exists: false } },
      { $set: { firm_id: defaultFirm._id } }
    );
    
    console.log(`Updated ${result.nModified} organizations`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();