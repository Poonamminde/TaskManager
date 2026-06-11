import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Task, { type TaskStatus } from '../models/Task';
import { AppError } from '../middleware/errorHandler';

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { title, description, status, dueDate } = req.body as {
      title: string;
      description?: string;
      status?: string;
      dueDate?: string;
    };

    const task = await Task.create({
      user: req.user!._id,
      title,
      description,
      ...(status && { status: status as TaskStatus }),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const VALID_STATUSES = ['todo', 'in-progress', 'done'];
    const statusFilter = req.query['status'] as string | undefined;

    if (statusFilter && !VALID_STATUSES.includes(statusFilter)) {
      next(new AppError(`Invalid status filter. Use one of: ${VALID_STATUSES.join(', ')}`, 400));
      return;
    }

    const query: Record<string, unknown> = { user: req.user!._id };
    if (statusFilter) query['status'] = statusFilter;

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { id } = req.params as { id: string };

    if (!isValidObjectId(id)) {
      next(new AppError('Invalid task ID', 400));
      return;
    }

    const { title, description, status, dueDate } = req.body as {
      title?: string;
      description?: string;
      status?: string;
      dueDate?: string | null;
    };

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (title !== undefined)       updates['title'] = title;
    if (description !== undefined) updates['description'] = description;
    if (status !== undefined)      updates['status'] = status;
    if (dueDate !== undefined)     updates['dueDate'] = dueDate ? new Date(dueDate) : null;

    if (Object.keys(updates).length === 0) {
      next(new AppError('No update fields provided', 400));
      return;
    }

    // Enforce ownership: filter by both _id and user
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user!._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      next(new AppError('Task not found or not authorized to update it', 404));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    if (!isValidObjectId(id)) {
      next(new AppError('Invalid task ID', 400));
      return;
    }

    // Enforce ownership: filter by both _id and user
    const task = await Task.findOneAndDelete({ _id: id, user: req.user!._id });

    if (!task) {
      next(new AppError('Task not found or not authorized to delete it', 404));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
