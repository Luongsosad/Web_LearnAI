'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Notify from '@/components/Notify';
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
  Home,
  MoreVertical,
  Settings,
  CreditCard,
  Volume2,
} from 'lucide-react';

import axios from 'axios';
import { useSidebarStore } from '@/lib/storage/sidebarState';
import { useAuth } from '@/contexts/auth.context';
import { PATH } from '@/lib/contants/path';

export default function Sidebar() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('success');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { isOpen, toggle } = useSidebarStore();
  const { user } = useAuth();
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const notifyLoginRequired = () => {
    setMessage('Bạn cần đăng nhập/đăng ký để trải nghiệm dịch vụ này.');
    setMessageType('error');
    // router.push(PATH.LOGIN);
    // toggle();
  };

  const handleFeatureAccess = (path: string, minPlan: number) => {
    if (!user) {
      notifyLoginRequired();
      return;
    }

    if (user.plan_id < minPlan) {
      setMessage('Bạn cần nâng cấp gói dịch vụ để sử dụng tính năng này!');
      setMessageType('error');
      return;
    }

    router.push(path);
    toggle();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error('Đăng xuất thất bại:', err);
    } finally {
      setIsLoggingOut(false);
      window.location.href = PATH.HOME; // Đảm bảo tải lại trang để cập nhật trạng thái đăng nhập
      toggle();
    }
  };

  const handleNav = (path: string) => {
    router.push(path);
    toggle();
  };

  if (!hasMounted) return null;

  return (
    <>
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-[#121212] text-white border-r border-gray-700 z-50 shadow-lg transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div>
          <div className="w-full border-b border-gray-700 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" className="w-[28px]" alt="" />
              <h2
                className="text-lg font-bold cursor-pointer"
                onClick={() => {
                  router.push(PATH.HOME);
                  toggle();
                }}
              >
                Learning by AI
              </h2>
            </div>
            <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
              <SidebarClose size={24} />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <NavItem icon={Home} label="Trang chủ" onClick={() => handleNav(PATH.HOME)} />
            <NavItem
              icon={MessageCircle}
              label="Chat AI"
              onClick={() => {
                handleFeatureAccess(PATH.CHAT, 1);
              }}
            />
            <NavItem
              icon={Headphones}
              label="Giao tiếp"
              onClick={() => {
                handleFeatureAccess(PATH.CONVERSATION, 2);
              }}
            />
            <NavItem
              icon={Volume2}
              label="Luyện nghe"
              onClick={() => {
                handleFeatureAccess(PATH.LISTEN_PRACTICE, 2);
              }}
            />
            <NavItem
              icon={Mic}
              label="Phát âm"
              onClick={() => {
                if (!user) {
                  notifyLoginRequired();
                  return;
                }
                setMessage('Tính năng đang phát triển!');
                setMessageType('info');
              }}
            />
            <NavItem
              icon={BookOpen}
              label="Flashcard"
              onClick={() => {
                handleFeatureAccess(PATH.FLASHCARDS, 1);
              }}
            />
            <NavItem
              icon={Library}
              label="Truyện song ngữ"
              onClick={() => {
                handleFeatureAccess(PATH.BILINGUAL_STORY, 2);
              }}
            />
            <NavItem
              icon={HelpCircle}
              label="Trắc nghiệm"
              onClick={() => {
                handleFeatureAccess(PATH.QUIZ, 3);
              }}
            />
          </div>
        </div>

        <div
          className="p-4 pr-1 pl-4 border-t border-gray-700 relative"
          onMouseLeave={() => setShowMenu(false)} // Ẩn menu khi di chuột ra khỏi cụm tài khoản
        >
          {user && (
            <div
              className={`
                absolute top-0 left-0 w-0 h-0 border-t-[36px] border-r-[36px] z-10
                ${
                  user.plan_id === 3
                    ? 'border-t-green-500'
                    : user.plan_id === 2
                      ? 'border-t-yellow-500'
                      : 'border-t-gray-600'
                } border-r-transparent
              `}
            >
              <span className="absolute -top-[30px] left-[-2px] rotate-[-45deg] text-[9px] w-[30px] text-center text-white font-bold tracking-widest">
                {user.plan_id === 3 ? 'Pro' : user.plan_id === 2 ? 'Basic' : 'Free'}
              </span>
            </div>
          )}

          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400 scale-[1.4]" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center">
                <div className="relative flex items-center">
                  <button
                    onClick={() => setShowMenu(!showMenu)} // Toggle menu khi click
                    onMouseEnter={() => setShowMenu(true)} // Hiện menu khi hover
                    className="hover:text-white text-gray-400 transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <div
                      className="absolute right-0 bottom-[40px] mt-2 w-44 rounded-md bg-[#1a1a1a] border border-neutral-700 shadow-lg z-50"
                      onMouseEnter={() => setShowMenu(true)} // Giữ menu khi hover vào
                      onMouseLeave={() => setShowMenu(false)} // Ẩn menu khi rời chuột
                    >
                      {[
                        { label: 'Tài khoản', path: PATH.ACCOUNT, icon: UserIcon },
                        { label: 'Mua gói dịch vụ', path: PATH.PLANS, icon: CreditCard },
                        { label: 'Cài đặt', path: PATH.SETTINGS, icon: Settings },
                      ].map(({ label, path, icon: Icon }) => (
                        <button
                          key={label}
                          onClick={() => {
                            setShowMenu(false);
                            router.push(path);
                            toggle();
                          }}
                          className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white"
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="p-2 rounded hover:bg-neutral-800 transition"
                  >
                    <LogOut
                      className={`w-4 h-4 ${
                        isLoggingOut ? 'text-gray-500' : 'text-red-400 hover:text-red-500'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                toggle();
                router.push(PATH.LOGIN);
              }}
              className="bg-red-500 hover:bg-red-600 transition px-4 py-2 text-sm rounded w-full text-white font-medium"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
      <Notify message={message} type={messageType} duration={2000} onClose={() => setMessage(null)} />
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
