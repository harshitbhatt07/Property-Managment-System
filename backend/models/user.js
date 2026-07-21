import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['admin', 'agent'], default: 'agent' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
