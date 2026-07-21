import { body } from 'express-validator';

export const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'),
  body('password').notEmpty().withMessage('Password is required.'),
];
