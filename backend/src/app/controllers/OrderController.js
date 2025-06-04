import { v4 as uuidv4 } from 'uuid';
import { sendEmailOrder } from '../utils/email.js';
import {
  findPlanById,
  getAllPlans,
  createOrder,
  updateOrderStatus,
  updateUserPlan,
} from '../models/orderModels.js';

import dotenv from 'dotenv';

dotenv.config();

import { uploadToCloudinary } from '../utils/uploads.js';

// API khởi tạo thanh toán
async function payment(req, res) {
  const { planId, userId } = req.body;

  if (!planId || !userId) {
    return res.status(400).json({ error: 'Thiếu planId hoặc userId' });
  }

  try {

    // Lấy thông tin gói dịch vụ
    const planResult = await findPlanById(planId);
    console.log('Plan result:', planResult);

    if (!planResult) {
      return res.status(404).json({ error: 'Gói dịch vụ không tồn tại' });
    }

    const plan = planResult;
    const transactionId = uuidv4();
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      `STK:${process.env.BANK_ACCOUNT}|Bank:${process.env.BANK}|Amount:${plan.price}|Transaction:${transactionId}`
    )}`;

    // Trả về thông tin giao dịch
    const transactionData = {
      transactionId,
      amount: plan.price,
      bankAccount: process.env.BANK_ACCOUNT,
      accountHolder: process.env.BANK_ACCOUNT_HOLDER,
      bank: process.env.BANK,
      planName: plan.name,
      qrCode,
    };
    console.log('Transaction data:', transactionData);

    res.status(200).json(transactionData);
  } catch (error) {
    console.error('Lỗi khi khởi tạo thanh toán:', error);
    res.status(500).json({ error: 'Lỗi server khi khởi tạo thanh toán' });
  }
};

// API hoàn tất thanh toán
async function submit_payment(req, res) {
  const { transactionId, email, planId, userId } = req.body;
  const file = req.file;

  if (!transactionId || !email || !planId || !userId || !file) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc hoặc ảnh hóa đơn' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email không hợp lệ' });
  }

  try {
    const planResult = await findPlanById(planId);
    if (!planResult) {
      return res.status(404).json({ error: 'Gói dịch vụ không tồn tại' });
    }

    const plan = planResult;

    // upload ảnh và lấy url
    const imageUrl = await uploadToCloudinary(file, 'orders');

    await createOrder(userId, planId, transactionId, plan.price, email, imageUrl);
    await sendEmailOrder(email, plan.name, transactionId, plan.price);

    res.status(200).json({ message: 'Thanh toán hoàn tất, hóa đơn đã được gửi!' });
  } catch (error) {
    console.error('Lỗi khi hoàn tất thanh toán:', error);
    res.status(500).json({ error: 'Lỗi server khi hoàn tất thanh toán' });
  }
}

async function updateStatusOrder(req, res) {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  try {
    const updatedOrder = await updateOrderStatus(orderId, status);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái đơn hàng' });
  }
}


export { payment, submit_payment };