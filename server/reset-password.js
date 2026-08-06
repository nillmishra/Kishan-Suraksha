import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';

const email = 'nillmishra09@gmail.com';
const newPassword = 'Nill@0912';

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('✗ User not found');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    // Hash the new password
    const hash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.updateOne({ email: email.toLowerCase() }, { passwordHash: hash });
    
    console.log(`✓ Password reset successfully`);
    console.log(`✓ New password: ${newPassword}`);
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

resetPassword();
