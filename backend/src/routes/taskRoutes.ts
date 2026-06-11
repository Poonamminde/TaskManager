import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController';

const router = Router();

router.use(protect);

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('dueDate must be a valid ISO 8601 date (e.g. 2025-12-31)')
    .toDate(),
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('dueDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;           // allow clearing dueDate
      if (!/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
        throw new Error('dueDate must be a valid ISO 8601 date');
      }
      return true;
    }),
];

router.post('/', createTaskValidation, createTask);
router.get('/', getTasks);
router.patch('/:id', updateTaskValidation, updateTask);
router.delete('/:id', deleteTask);

export default router;
