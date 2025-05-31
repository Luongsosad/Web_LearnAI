"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LucideIcon,
  MessageCircle,
  BookOpen,
  Mic,
  Headphones,
  HelpCircle,
  Library,
  UserIcon,
  LogOut,
  SidebarClose,
  Home
} from "lucide-react";
import { SessionStorage } from "@/storage/sessionStorage";
import { useSidebarStore } from "@/storage/sidebarState";

import axios, { AxiosError } from 'axios';
import User from '@/types/User';

export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const { isOpen, toggle } = useSidebarStore();

  const getProfile = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/a/profile`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.status !== 200) throw new Error("Lỗi API");

      if (res.data.user) {
        SessionStorage.saveUser(res.data.user);
        setUser(res.data.user);
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.log(error);

      SessionStorage.clearUser();
      return;
    }
  }

  useEffect(() => {
    setHasMounted(true);
    getProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error('Đăng xuất thất bại:', err);
      // Có thể hiện thông báo nếu muốn
    } finally {
      SessionStorage.clearUser();
      setUser(null);
      router.push('/login');
      toggle();
    }
  };


  const handleNav = (path: string) => {
    if (!user?.username) {
      router.push("/login");
    } else {
      router.push(path);
    }
    toggle();
  };

  if (!hasMounted) return null;

  return (
    <>
      {/* Overlay chỉ hiện khi mở */}
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Sidebar luôn render, chỉ translateX để ẩn hiện */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-[#121212] text-white border-r border-gray-700 z-50 shadow-lg transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Nội dung sidebar như cũ */}

        <div>
          <div className="w-full border-b border-gray-700 p-3 flex justify-between items-center">
            <h2 className="text-lg font-bold cursor-pointer" onClick={() => {
              router.push("/");
              toggle();
            }}>Learning by AI</h2>
            <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
              <SidebarClose size={24} />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <NavItem icon={Home} label="Trang chủ" onClick={() => handleNav("/")} />
            <NavItem icon={MessageCircle} label="Chat AI" onClick={() => handleNav("/chat")} />
            <NavItem icon={Headphones} label="Giao tiếp" onClick={() => handleNav("/conversation")} />
            <NavItem icon={Mic} label="Phát âm" onClick={() => handleNav("/pronunciation")} />
            <NavItem icon={BookOpen} label="Flashcard" onClick={() => handleNav("/flashcards")} />
            <NavItem icon={Library} label="Truyện song ngữ" onClick={() => handleNav("/bilingual-stories")} />
            <NavItem icon={HelpCircle} label="Trắc nghiệm" onClick={() => handleNav("/quiz")} />
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-300" />
                <span className="text-sm">{user.username}</span>
              </div>
              <button onClick={handleLogout}>
                <LogOut className="w-4 h-4 text-red-400 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                toggle();
                router.push("/login");
              }}
              className="bg-red-500 text-white px-4 py-2 text-sm rounded hover:bg-red-600 w-full"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

    </>
  );
}

function NavItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-2 rounded hover:bg-[#2a2a2a] transition"
    >
      <Icon className="w-5 h-5 mr-3 text-gray-300" />
      <span className="text-sm">{label}</span>
    </button>
  );
}
