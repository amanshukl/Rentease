import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  monthlyRent: number;
  tenure: number;
  quantity: number;
  securityDeposit: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalMonthlyRent: number;
  totalSecurityDeposit: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  startDate: Date;
  endDate: Date;
  returnRequested: boolean;
  returnDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        monthlyRent: {
          type: Number,
          required: true,
        },
        tenure: {
          type: Number,
          required: true,
          enum: [3, 6, 12],
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        securityDeposit: {
          type: Number,
          required: true,
        },
      },
    ],
    totalMonthlyRent: {
      type: Number,
      required: true,
    },
    totalSecurityDeposit: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    returnRequested: {
      type: Boolean,
      default: false,
    },
    returnDate: Date,
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ status: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
