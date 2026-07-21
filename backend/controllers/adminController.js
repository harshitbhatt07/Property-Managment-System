import { Property, User } from '../models/index.js';

export async function dashboard(req, res, next) {
  try {
    const [total, available, rented, maintenance, totalAgents, pendingRequests] = await Promise.all([
      Property.countDocuments(), Property.countDocuments({ status: 'Available' }), Property.countDocuments({ status: 'Rented' }),
      Property.countDocuments({ status: 'Maintenance' }), User.countDocuments({ role: 'agent', approvalStatus: 'approved' }),
      User.countDocuments({ role: 'agent', approvalStatus: 'pending' }),
    ]);
    res.json({ total, available, rented, maintenance, totalAgents, pendingRequests });
  } catch (error) { next(error); }
}

export async function agents(req, res, next) {
  try {
    const list = await User.find({ role: 'agent' }).sort({ createdAt: -1 }).lean();
    const counts = await Property.aggregate([{ $group: { _id: '$createdBy', count: { $sum: 1 } } }]);
    const map = new Map(counts.map((item) => [String(item._id), item.count]));
    res.json(list.map(({ password, ...agent }) => ({ ...agent, propertyCount: map.get(String(agent._id)) || 0 })));
  } catch (error) { next(error); }
}

export async function requests(req, res, next) {
  try { res.json(await User.find({ role: 'agent', approvalStatus: 'pending' }).select('-password').sort({ createdAt: -1 })); }
  catch (error) { next(error); }
}

export async function updateAgentStatus(req, res, next) {
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'agent' }, { approvalStatus: req.body.status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Agent not found.' });
    res.json(user);
  } catch (error) { next(error); }
}
