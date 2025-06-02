"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "lucide-react";
import { SessionStorage } from "@/storage/sessionStorage";
import { useSidebarStore } from "@/storage/sidebarState";
import User from "@/types/User";
import LoadedOverlay from "@/components/LoadedOverlay";
import Notify from "@/components/Notify";

export default function AccountPage() {
    const { toggle } = useSidebarStore();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        SessionStorage.getUser(
            (loading) => setLoading(loading),
            (user) => setUser(user)
        );
    }, []);

    const plans = [
        {
            name: "Free",
            price: 0,
            duration_days: null,
            max_quota: 50,
            description: "Gói miễn phí, giới hạn 50 flashcard hoặc lượt chat",
        },
        {
            name: "Premium Basic",
            price: 5.99,
            duration_days: 30,
            max_quota: 500,
            description: "Gói cơ bản – 500 lượt / tháng",
        },
        {
            name: "Premium Pro",
            price: 9.99,
            duration_days: 30,
            max_quota: 2000,
            description: "Gói nâng cao – 2000 lượt / tháng, ưu tiên tốc độ",
        },
    ];

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
                    <div className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">Tài khoản</div>
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
            <div className="custom-scroll w-full md:w-[768px] mx-auto mt-[82px]">
                <div className="flex-1 p-5">
                    <h2 className="text-xl font-semibold text-gray-300 mb-4">Thông tin tài khoản</h2>
                    {user ? (
                        <div className="bg-[#1c1c1c] p-6 rounded-xl">
                            <div className="grid gap-4">
                                {/* Username */}
                                <div>
                                    <label className="text-gray-400">Tên người dùng</label>
                                    <p className="text-white">{user.username}</p>
                                </div>
                                {/* Email */}
                                <div>
                                    <label className="text-gray-400">Email</label>
                                    <p className="text-white">{user.email}</p>
                                </div>
                                {/* Plan ID */}
                                <div>
                                    <label className="text-gray-400">Gói dịch vụ</label>
                                    <p className="text-white">{user.plan_id ? `${plans[user.plan_id - 1].name}` : "Chưa có gói"}</p>
                                </div>
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