import { Property } from '../models/index.js';
import { notifyAdmins } from '../utils/notifications.js';

function queryFilter(req) {
  const { search = '', status = '', type = '' } = req.query;
  const filter = req.user.role === 'agent' ? { createdBy: req.user._id } : {};
  if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { location: new RegExp(search, 'i') }];
  if (status) filter.status = status;
  if (type) filter.type = type;
  return filter;
}

export async function listProperties(req, res, next) {
  try { res.json(await Property.find(queryFilter(req)).populate('createdBy', 'name email role').sort({ createdAt: -1 })); }
  catch (error) { next(error); }
}

export async function createProperty(req, res, next) {
  try {
    const property = await Property.create({ ...req.body, createdBy: req.user._id });
    await property.populate('createdBy', 'name email role');
    if (req.user.role === 'agent') await notifyAdmins({ actor: req.user._id, type: 'property_created', title: 'Property Added', message: `${req.user.name} added “${property.title}”.`, metadata: { propertyId: property._id } });
    res.status(201).json(property);
  } catch (error) { next(error); }
}

export async function updateProperty(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    const ownsProperty = String(property.createdBy) === String(req.user._id);
    if (req.user.role !== 'admin' && !ownsProperty) return res.status(403).json({ message: 'You can update only your properties.' });
    const allowed = ['title', 'type', 'location', 'rent', 'status', 'bedrooms', 'bathrooms', 'description'];
    allowed.forEach((key) => { if (req.body[key] !== undefined) property[key] = req.body[key]; });
    await property.save();
    await property.populate('createdBy', 'name email role');
    if (req.user.role === 'agent') await notifyAdmins({ actor: req.user._id, type: 'property_updated', title: 'Property Updated', message: `${req.user.name} updated “${property.title}”.`, metadata: { propertyId: property._id } });
    res.json(property);
  } catch (error) { next(error); }
}

export async function deleteProperty(req, res, next) {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    res.json({ message: 'Property deleted successfully.' });
  } catch (error) { next(error); }
}
