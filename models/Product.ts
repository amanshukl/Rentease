import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: 'furniture' | 'appliance';
  subcategory: string;
  monthlyRent: number;
  securityDeposit: number;
  images: string[];
  features: string[];
  dimensions?: string;
  brand?: string;
  condition: 'new' | 'like-new' | 'good';
  availableStock: number;
  totalStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['furniture', 'appliance'],
    },
    subcategory: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Rent cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: [0, 'Deposit cannot be negative'],
    },
    images: {
      type: [String],
      default: ['/images/placeholder.svg'],
    },
    features: {
      type: [String],
      default: [],
    },
    dimensions: String,
    brand: String,
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good'],
      default: 'new',
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
