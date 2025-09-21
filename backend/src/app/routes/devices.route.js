import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { listDevices, logoutDevice, logoutAllDevices } from '../controllers/DeviceController.js';

const devicesRoute = express.Router();

devicesRoute.get('/', authenticateToken, listDevices); // Lấy danh sách thiết bị

devicesRoute.post('/logout', authenticateToken, logoutDevice); // Đăng xuất thiết bị cụ thể

devicesRoute.post('/logout-all', authenticateToken, logoutAllDevices); // Đăng xuất toàn bộ thiết bị

export { devicesRoute };
