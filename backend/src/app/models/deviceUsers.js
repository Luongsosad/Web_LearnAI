import pool from '../config/database.js';

// Thêm thiết bị mới
export async function addDeviceUser(userId, deviceId, deviceInfo, refreshToken) {
  const result = await pool.query(
    'INSERT INTO device_users (user_id, device_id, device_info, refresh_token) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, deviceId, deviceInfo, refreshToken]
  );
  console.log('Added device:', result.rows[0]);
  return result.rows[0];
}

// Lấy danh sách thiết bị của user
export async function getDeviceUsers(userId) {
  const result = await pool.query(
    'SELECT * FROM device_users WHERE user_id = $1 ORDER BY last_active DESC',
    [userId]
  );
  return result.rows;
}

// Lấy token của thiết bị cụ thể
export async function getDeviceUserToken(userId, deviceId) {
  const result = await pool.query(
    'SELECT * FROM device_users WHERE user_id = $1 AND device_id = $2',
    [userId, deviceId]
  );
  return result.rows[0];
}

// Xóa thiết bị theo id
export async function deleteDeviceUser(deviceId, userId) {
  await pool.query('DELETE FROM device_users WHERE id = $1 AND user_id = $2', [deviceId, userId]);
}

// Xóa toàn bộ thiết bị của user
export async function deleteAllDeviceUsers(userId) {
  await pool.query('DELETE FROM device_users WHERE user_id = $1', [userId]);
}

// Kiểm tra refreshToken có tồn tại cho user
export async function findDeviceByDeviceId(userId, deviceId) {
  const result = await pool.query(
    'SELECT * FROM device_users WHERE user_id = $1 AND device_id = $2',
    [userId, deviceId]
  );
  return result.rows[0];
}

// Cập nhật last_active
export async function updateDeviceLastActive(deviceId) {
  await pool.query('UPDATE device_users SET last_active = now() WHERE id = $1', [deviceId]);
}
