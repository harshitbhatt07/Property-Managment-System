import { body } from 'express-validator';

export const propertyRules = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters.'),
  body('type').isIn(['Apartment', 'House', 'Villa', 'Commercial', 'Office', 'Shop']).withMessage('Invalid property type.'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location is required.'),
  body('rent').toFloat().isFloat({ min: 0 }).withMessage('Rent must be zero or greater.'),
  body('status').isIn(['Available', 'Rented', 'Maintenance']).withMessage('Invalid status.'),
  body('bedrooms').optional().toInt().isInt({ min: 0 }),
  body('bathrooms').optional().toInt().isInt({ min: 0 }),
];
