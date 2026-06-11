import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env['PORT'] ?? 5000;
const CLIENT_URL = process.env['CLIENT_URL'] ?? 'http://localhost:5173';

connectDB();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'TaskManager API is running 🚀' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 TaskManager API running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env['NODE_ENV'] ?? 'development'}\n`);
});

export default app;
