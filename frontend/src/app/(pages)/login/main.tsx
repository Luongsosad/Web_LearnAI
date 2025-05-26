"use client";
import React, { useState } from "react";
import { Mail, Lock, Github, LogIn, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { SessionStorage } from "@/storage/sessionStorage";

interface User {
  username: string;
  email: string;
  token: string;
}

export default function Main() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    const user: User = {
      username: username || "Lương",
      email: email || "nguyenvinhluong242004@gmail.com",
      token: "fake-token-123",
    };
    SessionStorage.saveUser(user); // Lưu vào sessionStorage
    router.push("/");
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#111111] text-white px-4">
      <div className="w-full max-w-md bg-[#171717] p-6 rounded-xl shadow-lg border border-[#262626]">
        <div className="flex flex-col items-center mb-6">
          <UserCircle className="w-12 h-12 text-blue-400 mb-2" />
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center border border-gray-600 rounded-lg p-2">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="Gmail"
              className="bg-transparent w-full outline-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-center border border-gray-600 rounded-lg p-2">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="bg-transparent w-full outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Đăng nhập
          </button>

          <div className="text-center text-gray-500 text-sm">Hoặc đăng nhập bằng</div>

          <div className="flex justify-between space-x-4">
            <button className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 py-2 rounded-lg text-sm">
              <Mail className="w-4 h-4 mr-2" />
              Google
            </button>
            <button className="flex-1 flex items-center justify-center bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </button>
          </div>

          <div className="text-center text-sm mt-4">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-400 hover:underline"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}