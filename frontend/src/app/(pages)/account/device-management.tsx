import { useEffect, useState } from 'react';
import axios from 'axios';
import { Monitor, Smartphone } from 'lucide-react';

type Device = {
  id: number;
  type: string;
  device_info: string;
  last_login: string;
  is_current: boolean;
  created_at: string;
};

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/devices`, {
        withCredentials: true,
      });
      console.log('Device response:', res.data);
      setDevices(res.data.devices || []);
    } catch {
      setError('Không lấy được danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleLogoutDevice = async (deviceId: number) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/devices/logout`,
        { deviceId },
        {
          withCredentials: true,
        }
      );
      console.log('Logout device successfully');
      setDevices(devices.filter((d) => d.id !== deviceId));
    } catch {
      setError('Đăng xuất thiết bị thất bại');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/devices/logout-all`,
        {},
        {
          withCredentials: true,
        }
      );
      setDevices([]);
    } catch {
      setError('Đăng xuất tất cả thất bại');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Active Sessions</h2>
      {loading ? <div>Đang tải...</div> : null}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="rounded-lg bg-[#181818] p-4 shadow-md">
        <div className="flex flex-col gap-2">
          {devices.length === 0 && (
            <div className="text-gray-400">Không có thiết bị nào đang đăng nhập.</div>
          )}
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between py-3 px-2 border-b border-[#232323] last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {device.type === 'Mobile' ? (
                  <Smartphone className="w-5 h-5 text-gray-300" />
                ) : (
                  <Monitor className="w-5 h-5 text-gray-300" />
                )}
                <span className="font-medium text-white">
                  {device.type === 'Web'
                    ? 'Web'
                    : device.type === 'Desktop App'
                      ? 'Desktop App'
                      : 'Mobile'}
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  {`Created ${Math.floor((Date.now() - new Date(device.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {device.is_current && (
                  <span className="text-green-500 text-xs font-semibold mr-2">Current</span>
                )}
                {!device.is_current && (
                  <button
                    onClick={() => handleLogoutDevice(device.id)}
                    className="px-3 py-1 bg-[#232323] text-gray-200 rounded hover:bg-red-500 hover:text-white transition"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {devices.length > 1 && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleLogoutAll}
              className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
            >
              Revoke All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
