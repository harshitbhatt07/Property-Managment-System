import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { createToken } from '../middleware/auth.js';
import { notifyAdmins } from '../utils/notifications.js';
import { safeUser } from '../utils/user.js';

export async function register(req, res, next) {
  try {
    if (await User.findOne({ email: req.body.email })) return res.status(409).json({ message: 'Email already registered.' });
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 12),
      role: 'agent',
      approvalStatus: 'pending',
    });
    await notifyAdmins({ actor: user._id, type: 'agent_request', title: 'New Agent Registration Request', message: `${user.name} (${user.email}) requested an Agent account.`, metadata: { agentId: user._id } });
    res.status(201).json({ pending: true, message: 'Registration request sent. Waiting for Admin approval.' });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
    if (user.role === 'agent' && user.approvalStatus !== 'approved') {
      return res.status(403).json({ message: user.approvalStatus === 'blocked' ? 'Your account request was blocked by Admin.' : 'Waiting for Admin approval.' });
    }
    res.json({ token: createToken(user), user: safeUser(user) });
  } catch (error) { next(error); }
}

export function me(req, res) { res.json(safeUser(req.user)); }
