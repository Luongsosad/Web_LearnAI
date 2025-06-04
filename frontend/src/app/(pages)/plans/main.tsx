"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SessionStorage } from "@/storage/sessionStorage";
import { useSidebarStore } from "@/storage/sidebarState";
import User from "@/types/User";
import LoadedOverlay from "@/components/LoadedOverlay";
import Notify from "@/components/Notify";
import PlanBadge from "@/components/PlanBadge";

export default function PlansPage() {
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "checkout">("plans");
  const [transaction, setTransaction] = useState<{
    transactionId: string;
    amount: number;
    bankAccount: string;
    accountHolder: string;
    bank: string;
    planName: string;
    qrCode: string;
    expiresAt: number;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [transactionImage, setTransactionImage] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    SessionStorage.getUser(
      (loading) => setLoading(loading),
      (user) => setUser(user)
    );

    // Check session for existing transaction
    const storedTransaction = SessionStorage.getTransaction();
    if (storedTransaction && storedTransaction.expiresAt > Date.now()) {
      setTransaction(storedTransaction);
      setActiveTab("checkout");
    } else if (storedTransaction) {
      // Clear expired transaction
      SessionStorage.clearTransaction();
      setMessage("Giao dịch đã hết hạn, vui lòng thử lại!");
      setActiveTab("plans");
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (transaction?.expiresAt) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeRemaining = transaction.expiresAt - now;
        if (timeRemaining <= 0) {
          SessionStorage.clearTransaction();
          setTransaction(null);
          setActiveTab("plans");
          setMessage("Giao dịch đã hết hạn!");
          clearInterval(interval);
        } else {
          const minutes = Math.floor(timeRemaining / 1000 / 60);
          const seconds = Math.floor((timeRemaining / 1000) % 60);
          setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [transaction]);

  const plans = [
    {
      id: 1,
      name: "Free",
      price: 0,
      duration_days: null,
      max_quota: 50,
      description: "Gói miễn phí - Miễn phí truy cập chat, flashcard",
    },
    {
      id: 2,
      name: "Premium Basic",
      price: 5.99,
      duration_days: 30,
      max_quota: 500,
      description: "Gói cơ bản – Truy cập chat, flashcard, giao tiếp và đọc sách",
    },
    {
      id: 3,
      name: "Premium Pro",
      price: 9.99,
      duration_days: 30,
      max_quota: 2000,
      description: "Gói nâng cao – Truy cập tất cả tính năng của ứng dụng",
    },
  ];

  const handleUpgradePlan = async (planId: number) => {
    if (!user?.username) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setSelectedPlan(planId);

      // Call payment API using axios
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/order/payment`,
        { planId, userId: user.id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const data = response.data;
      const transactionData = {
        transactionId: data.transactionId,
        amount: data.amount,
        bankAccount: data.bankAccount,
        accountHolder: data.accountHolder,
        bank: data.bank,
        planName: data.planName,
        qrCode: data.qrCode,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      };

      // Store transaction in session
      SessionStorage.setTransaction(transactionData);
      setTransaction(transactionData);
      setActiveTab("checkout");
    } catch (error: any) {
      console.error("Lỗi khi nâng cấp gói dịch vụ:", error);
      setMessage(error.response?.data?.error || "Lỗi khi khởi tạo thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async () => {
    if (!email || !selectedPlan) {
      setMessage("Vui lòng nhập email!");
      return;
    }
    if (!transactionImage) {
      setMessage("Vui lòng tải lên hình ảnh giao dịch!");
      return;
    }

    try {
      setLoading(true);

      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("transactionId", transaction?.transactionId || "");
      formData.append("email", email);
      formData.append("planId", selectedPlan.toString());
      formData.append("userId", user?.id.toString() || "");
      formData.append("transactionImage", transactionImage);

      // Call API to send bill and save order using axios
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/order/complete-payment`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      // Clear transaction from session
      SessionStorage.clearTransaction();
      setTransaction(null);
      setTransactionImage(null);
      setActiveTab("plans");
      setMessage(response.data.message || "Thanh toán thành công! Hóa đơn đã được gửi đến email của bạn.");
    } catch (error: any) {
      console.error("Lỗi khi hoàn tất thanh toán:", error);
      setMessage(error.response?.data?.error || "Lỗi khi hoàn tất thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    // Clear transaction from session
    SessionStorage.clearTransaction();
    setTransaction(null);
    setTransactionImage(null);
    setActiveTab("plans");
    setMessage("Đã hủy giao dịch thanh toán.");
  };

  return (
    <div className="flex flex-col max-h-screen text-white w-full">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-[#111111]">
        <div className="relative flex items-center justify-between px-4 py-3.5 border-b border-gray-700">
          <div className="flex justify-start">
            <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
              <Sidebar size={24} />
            </button>
          </div>
          <div className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">
            {activeTab === "plans" ? "Gói dịch vụ" : "Thanh toán"}
          </div>
          <div className="flex space-x-4 justify-end">
            {user?.username && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 truncate overflow-hidden whitespace-nowrap max-w-[70px] md:whitespace-normal md:overflow-visible md:max-w-none md:truncate-0">
                  {user.username || "bạn"}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mt-1 mb-1">Learning by AI</div>
      </div>

      {/* Main Content */}
      <div className="custom-scroll w-full md:w-[768px] mx-auto mt-[72px]">
        {activeTab === "plans" ? (
          <div className="flex-1 p-5">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Gói dịch vụ</h2>
            <div className="grid gap-4 md:grid-cols-1">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a]"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                    <p className="text-gray-300">Giá: ${plan.price}/tháng</p>
                    <p className="text-gray-300">Lượt tối đa: {plan.max_quota}</p>
                    {plan.duration_days && (
                      <p className="text-gray-300">Thời hạn: {plan.duration_days} ngày</p>
                    )}
                  </div>
                  {user && user?.plan_id < plan.id ? (
                    <button
                      onClick={() => handleUpgradePlan(plan.id)}
                      className="p-2 w-[100px] bg-red-400 hover:bg-red-500 rounded-lg"
                    >
                      Nâng cấp
                    </button>
                  ) : (
                    <button
                      disabled
                      className="p-2 w-[100px] bg-gray-600 cursor-not-allowed rounded-lg"
                    >
                      Đã sở hữu
                    </button>
                  )}
                  <PlanBadge level={plan.id} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-5">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Thông tin thanh toán</h2>
            {transaction && (
              <div className="bg-[#1c1c1c] p-4 rounded-xl">
                <p className="text-gray-300">Mã giao dịch: {transaction.transactionId}</p>
                <p className="text-gray-300">Số tiền: ${transaction.amount}</p>
                <p className="text-gray-300">Số tài khoản: {transaction.bankAccount}</p>
                <p className="text-gray-300">Chủ tài khoản: {transaction.accountHolder}</p>
                <p className="text-gray-300">Ngân hàng: {transaction.bank}</p>
                <p className="text-gray-300">Gói dịch vụ: {transaction.planName}</p>
                <img src={transaction.qrCode} alt="QR Code" className="w-40 h-40 mt-4 mb-3" />
                <p className="text-gray-400 text-sm">
                  Thời gian còn lại: <span className="font-bold">{timeLeft}</span>
                </p>
                <div className="mt-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email để nhận hóa đơn"
                    className="w-full p-2 bg-[#2a2a2a] text-white rounded-lg mb-4"
                  />
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => setTransactionImage(e.target.files?.[0] || null)}
                    className="w-full p-2 bg-[#2a2a2a] text-white rounded-lg mb-4"
                  />
                  <button
                    onClick={handlePaymentComplete}
                    className="mt-4 p-2 w-full bg-green-500 hover:bg-green-600 rounded-lg"
                  >
                    Xác nhận đã thanh toán
                  </button>
                  <button
                    onClick={handlePaymentCancel}
                    className="mt-4 p-2 w-full bg-red-500 hover:bg-red-600 rounded-lg"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#5a595941] text-center">
          <p className="text-sm text-gray-500">© 2025 Learning By AI. All rights reserved.</p>
        </div>
      </div>
      {loading && <LoadedOverlay />}
      <Notify
        message={message}
        type="info"
        duration={2000}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}