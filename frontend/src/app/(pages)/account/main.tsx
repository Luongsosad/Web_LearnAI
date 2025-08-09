'use client';
import React, { useState, useEffect } from 'react';
import { SessionStorage } from '@/storage/sessionStorage';
import { User } from '@/types/User';
import LoadedOverlay from '@/components/LoadedOverlay';
import Notify from '@/components/Notify';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/shared/header';

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const user = await SessionStorage.getUser(
        (loading) => setLoading(loading),
        (user) => setUser(user)
      );

      if (!user) {
        router.push('/login');
      }
      setIsAuthorized(true);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/a/profile-detail`, {
          withCredentials: true,
        });
        setUserDetails(res.data.user);
        console.log('User details:', res.data.user);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  const plans = [
    {
      name: 'Free',
      price: 0,
      duration_days: null,
      max_quota: 50,
      description: 'Gói miễn phí, giới hạn 50 flashcard hoặc lượt chat',
    },
    {
      name: 'Premium Basic',
      price: 5.99,
      duration_days: 30,
      max_quota: 500,
      description: 'Gói cơ bản – 500 lượt / tháng',
    },
    {
      name: 'Premium Pro',
      price: 9.99,
      duration_days: 30,
      max_quota: 2000,
      description: 'Gói nâng cao – 2000 lượt / tháng, ưu tiên tốc độ',
    },
  ];

  const closeModal = () => {
    setSelectedOrderId(null);
  };

  const selectedOrder = userDetails?.orders?.find((order) => order.id === selectedOrderId);

  if (!isAuthorized) return null;

  return (
    <div className="flex flex-col max-h-screen text-white w-full">
      {/* Header */}
      <Header user={user} title="Tài khoản" />

      {/* Main Content */}
      <div className="custom-scroll w-full md:w-[768px] mx-auto mt-[82px]">
        <div className="flex-1 p-5">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Thông tin tài khoản</h2>
          {userDetails ? (
            <div className="bg-[#1c1c1c] p-4 rounded-xl">
              <div className="grid gap-4">
                {/* Username */}
                <div>
                  <label className="text-gray-400">Tên người dùng</label>
                  <p className="text-white">{userDetails.username}</p>
                </div>
                {/* Email */}
                <div>
                  <label className="text-gray-400">Email</label>
                  <p className="text-white">{userDetails.email}</p>
                </div>
                {/* Plan ID */}
                <div>
                  <label className="text-gray-400">Gói dịch vụ</label>
                  <p className="text-white">
                    {userDetails.plan_id
                      ? `${plans[userDetails.plan_id - 1]?.name ?? 'Không xác định'}`
                      : 'Chưa có gói'}
                  </p>
                </div>

                {/* Order List */}
                {userDetails.orders && userDetails.orders.length > 0 && (
                  <div>
                    <label className="text-gray-400">Danh sách đơn hàng</label>
                    <div className="space-y-3 mt-2">
                      {userDetails.orders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-[#2a2a2a] p-3 rounded-lg flex justify-between text-sm items-center"
                        >
                          <div>
                            {/* <p><strong>ID:</strong> {order.id}</p> */}
                            <p>
                              <strong>Plan:</strong> {plans[order.plan_id - 1]?.name}
                            </p>
                            <p>
                              <strong>Trạng thái:</strong>{' '}
                              <span className="capitalize">{order.status}</span>
                            </p>
                            <p>
                              <strong>Giá:</strong> ${order.amount}
                            </p>
                          </div>
                          <button
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#5a595941] text-center">
          <p className="text-sm text-gray-500">© 2025 Learning By AI. All rights reserved.</p>
        </div>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-[#1c1c1c] rounded-xl p-6 w-[90%] max-w-md text-white relative">
            <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h3>
            <div className="space-y-2 text-sm">
              {/* <p><strong>ID:</strong> {selectedOrder.id}</p> */}
              <p>
                <strong>Trạng thái:</strong>{' '}
                <span className="capitalize">{selectedOrder.status}</span>
              </p>
              <p>
                <strong>Gói dịch vụ:</strong> {plans[selectedOrder.plan_id - 1]?.name}
              </p>
              <p>
                <strong>Transaction ID:</strong> {selectedOrder.transaction_id}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.email}
              </p>
              <p>
                <strong>Ngày tạo:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Giá:</strong> ${selectedOrder.amount}
              </p>
              {/* {selectedOrder.image && (
                                <div className="mt-3">
                                    <p><strong>Hình ảnh:</strong></p>
                                    <img
                                        src={selectedOrder.image}
                                        alt="Order Image"
                                        className="mt-1 max-h-48 rounded-md border border-gray-600"
                                    />
                                </div>
                            )} */}
            </div>
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-4xl"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {loading && <LoadedOverlay />}
      <Notify message={message} type="info" duration={2000} onClose={() => setMessage(null)} />
    </div>
  );
}
