import pool from '../config/database.js';

// Lấy thông tin gói dịch vụ theo ID
async function findPlanById(planId) {
    const query = 'SELECT * FROM plans WHERE id = $1';
    try {
        const res = await pool.query(query, [planId]);
        if (res.rows.length === 0) {
            throw new Error('Gói dịch vụ không tồn tại');
        }
        return res.rows[0];
    } catch (err) {
        throw new Error('Lỗi khi tìm gói dịch vụ: ' + err.message);
    }
}

// Lấy tất cả gói dịch vụ
async function getAllPlans() {
    const query = 'SELECT * FROM plans ORDER BY id';
    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        throw new Error('Lỗi khi lấy danh sách gói dịch vụ: ' + err.message);
    }
}

// Tạo đơn hàng mới
async function createOrder(userId, planId, transactionId, amount, email, image) {
    const query = `
    insert into orders (user_id, plan_id, transaction_id, amount, email, image, status, created_at)
    values ($1, $2, $3, $4, $5, $6, 'pending', now())
    returning id, user_id, plan_id, transaction_id, amount, email, image, status, created_at
  `;
    const values = [userId, planId, transactionId, amount, email, image];
    try {
        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (err) {
        throw new Error('Lỗi khi tạo đơn hàng: ' + err.message);
    }
}


// Cập nhật trạng thái đơn hàng
async function updateOrderStatus(orderId, status) {
    const query = `
    UPDATE orders SET status = $1 WHERE id = $2
    RETURNING id, user_id, plan_id, transaction_id, amount, email, status, created_at
  `;
    try {
        const res = await pool.query(query, [status, orderId]);
        if (res.rows.length === 0) {
            throw new Error('Đơn hàng không tồn tại');
        }
        return res.rows[0];
    } catch (err) {
        throw new Error('Lỗi khi cập nhật trạng thái đơn hàng: ' + err.message);
    }
}

// Cập nhật gói dịch vụ của người dùng
async function updateUserPlan(userId, planId) {
    const query = 'UPDATE users SET plan_id = $1 WHERE id = $2 RETURNING id, username, plan_id';
    try {
        const res = await pool.query(query, [planId, userId]);
        if (res.rows.length === 0) {
            throw new Error('Người dùng không tồn tại');
        }
        return res.rows[0];
    } catch (err) {
        throw new Error('Lỗi khi cập nhật gói dịch vụ của người dùng: ' + err.message);
    }
}


export {
    findPlanById,
    getAllPlans,
    createOrder,
    updateOrderStatus,
    updateUserPlan,
};