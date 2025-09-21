import { getDeviceUsers, deleteDeviceUser, deleteAllDeviceUsers } from '../models/deviceUsers.js';

// Lấy danh sách thiết bị đăng nhập của user
export async function listDevices(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  const devices = await getDeviceUsers(userId);
  const currentRefreshToken = req.cookies['refresh_token'];

  // Hàm xác định loại thiết bị
  function getDeviceType(deviceInfo) {
    const info = deviceInfo.toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone'))
      return 'Mobile';
    if (info.includes('windows') || info.includes('macintosh') || info.includes('linux'))
      return 'Desktop App';
    if (info.includes('chrome') || info.includes('firefox') || info.includes('safari'))
      return 'Web';
    return 'Unknown';
  }

  const parsedDevices = devices.map((device) => ({
    id: device.id,
    type: getDeviceType(device.device_info),
    device_info: device.device_info,
    last_login: device.last_active || device.created_at,
    is_current: device.refresh_token === currentRefreshToken,
    created_at: device.created_at,
  }));

  return res.status(200).json({ devices: parsedDevices });
}

export async function getTokenOfDevice(req, res) {
  const userId = req.user?.id;
  const { deviceId } = req.body;
  if (!userId || !deviceId) return res.status(400).json({ message: 'Missing info' });
  const device = await getDeviceUsers(userId, deviceId);
  if (!device) return res.status(404).json({ message: 'Device not found' });
  return res.status(200).json({ accessToken: device.access_token });
}

// Đăng xuất thiết bị cụ thể
export async function logoutDevice(req, res) {
  const userId = req.user?.id;
  const { deviceId } = req.body;
  if (!userId || !deviceId) return res.status(400).json({ message: 'Missing info' });
  await deleteDeviceUser(deviceId, userId);
  return res.status(200).json({ message: 'Device logged out' });
}

// Đăng xuất toàn bộ thiết bị
export async function logoutAllDevices(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  await deleteAllDeviceUsers(userId);
  return res.status(200).json({ message: 'All devices logged out' });
}
