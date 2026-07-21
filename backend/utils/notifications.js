import { Notification, User } from '../models/index.js';

export async function notifyAdmins(payload) {
  const admins = await User.find({ role: 'admin' }).select('_id');
  if (!admins.length) return;
  await Notification.insertMany(admins.map((admin) => ({ ...payload, recipient: admin._id })));
}
