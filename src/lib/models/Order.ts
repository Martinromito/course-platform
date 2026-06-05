// src/lib/models/Order.ts
// Modelo de pedido — almacena compras con items, cupón, envío y estado de pago

import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface IShippingAddress {
  name: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  mpPaymentId?: string;
  mpPreferenceId?: string;
  shippingAddress?: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v: IOrderItem[]) => v.length > 0, 'El pedido debe tener al menos un item'],
    },
    subtotal: { type: Number, required: true },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'refunded'],
      default: 'pending',
    },
    mpPaymentId: { type: String },
    mpPreferenceId: { type: String },
    shippingAddress: { type: ShippingAddressSchema },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
