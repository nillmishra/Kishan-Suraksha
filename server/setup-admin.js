import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/User.js';

const email = 'nillmishra09@gmail.com';

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('✗ User not found');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current admin status: ${user.isAdmin ? '✓ Admin' : '✗ Not admin'}`);

    // Update to admin
    await User.updateOne({ email: email.toLowerCase() }, { isAdmin: true });
    
    const updatedUser = await User.findOne({ email: email.toLowerCase() });
    console.log(`✓ Updated admin status: ${updatedUser.isAdmin ? '✓ Admin' : '✗ Not admin'}`);
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

setupAdmin();
