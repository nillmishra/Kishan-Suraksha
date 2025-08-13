import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: String,
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const shippingSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
    shippingMode: { type: String, enum: ['standard', 'express'], default: 'standard' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }, // IMPORTANT
    addresses: { type: [addressSchema], default: [] },
    shipping: { type: shippingSchema, default: {} },
  },
  { timestamps: true, collection: 'users' }
);

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model('User', userSchema);