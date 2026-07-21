import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['Apartment','House','Villa','Commercial','Office','Shop'] },
  location: { type: String, required: true, trim: true },
  rent: { type: Number, required: true, min: 0 },
  status: { type: String, required: true, enum: ['Available','Rented','Maintenance'], default: 'Available' },
  bedrooms: { type: Number, min: 0, default: 1 },
  bathrooms: { type: Number, min: 0, default: 1 },
  description: { type: String, trim: true, maxlength: 800, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Property = mongoose.model('Property', propertySchema);
