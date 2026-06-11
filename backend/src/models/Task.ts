import mongoose, { Document, Schema, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // fast look-ups by owner
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be one of: todo, in-progress, done',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;
