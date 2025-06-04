import express from 'express';
import { payment, submit_payment } from '../controllers/OrderController.js';
import multer from 'multer';
const upload = multer();

const orderRoute = express.Router();



// API khởi tạo thanh toán
orderRoute.post('/payment', payment);

// API hoàn tất thanh toán
orderRoute.post('/complete-payment', upload.single('transactionImage'), submit_payment);

export { orderRoute };