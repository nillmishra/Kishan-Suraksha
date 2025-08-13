import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  { productId: String, name: String, price: Number, qty: Number, image: String },
  { _id: false }
);
const addressSchema = new mongoose.Schema(
  { fullName: String, phone: String, line1: String, line2: String, city: String, state: String, pincode: String, country: String },
  { _id: false }
);
const pricingSchema = new mongoose.Schema(
  { subtotal: Number, discount: Number, taxes: Number, delivery: Number, total: Number, promoCode: String },
  { _id: false }
);
const timelineSchema = new mongoose.Schema(
  { label: String, at: { type: Date, default: Date.now } },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    items: { type: [orderItemSchema], default: [] },
    address: addressSchema,
    shippingMode: { type: String, enum: ['standard', 'express'], default: 'standard' },
    pricing: pricingSchema,
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    status: { type: String, enum: ['PLACED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'], default: 'PLACED' },
    timeline: { type: [timelineSchema], default: [{ label: 'Order placed' }] },
    eta: { type: Date },
  },
  { timestamps: true, collection: 'orders' }
);

export const Order = mongoose.model('Order', orderSchema);