"use client";
import React, { useRef, useState, useEffect } from "react";
import { Plus, Settings2, Mic, Send } from "lucide-react";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function Main() {
  const [text, setText] = useState(""); // biến lưu nội dung input
  const [messages, setMessages] = useState<Message[]>([]); // danh sách tin nhắn
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // ref để cuộn xuống cuối

  // điều chỉnh chiều cao textarea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    setText(e.currentTarget.value);
  };

  // gọi API gửi câu hỏi và nhận câu trả lời
  const sendMessage = async () => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setText("");

    try {
      const res = await fetch("/api/groqChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text.trim() }),
      });

      if (!res.ok) throw new Error("Lỗi API");

      const data = await res.json();
      const botMessage: Message = {
        role: "bot",
        content: data.script || "Không có phản hồi.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage: Message = {
        role: "bot",
        content: "Lỗi khi lấy phản hồi, vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  // gửi khi nhấn enter (không shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // tự động cuộn xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen text-white">
      {/* thanh đầu */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="w-6 h-6 border rounded-full border-white" />
        <div className="text-xl font-semibold">Learning By AI</div>
        <div className="w-6 h-6 border rounded-full border-white" />
      </div>

      {/* thông báo */}
      <div className="text-center text-sm text-gray-400 mt-2">Bộ nhớ đã lưu đã đầy</div>

      {/* phần chính - hiển thị tin nhắn */}
      <div className="flex-1 flex flex-col px-4 py-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center text-center text-gray-400 flex-grow">
            <h1 className="text-2xl font-medium">Tôi có thể giúp gì cho bạn?</h1>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg whitespace-pre-line ${msg.role === "user"
                ? "max-w-[70%] bg-blue-600 self-end text-white"
                : "self-start text-gray-300"
                }`}
            >
              {msg.content}
            </div>
          ))
        )}

        {/* div ẩn để scroll tới */}
        <div ref={messagesEndRef} />
      </div>

      {/* input */}
      <div className="px-3 py-2 mb-2">
        <div className="flex flex-col items-end gap-4 bg-[#302f2f] rounded-2xl px-4 py-2">
          <div className="flex-1 w-full">
            <textarea
              ref={textareaRef}
              value={text}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Hỏi bất kỳ điều gì"
              className="w-full bg-transparent resize-none overflow-hidden text-white placeholder-gray-400 focus:outline-none text-sm pt-2"
            />
          </div>
          <div className="flex w-full justify-between pb-1">
            <div className="flex gap-2">
              <Plus size={20} className="text-white" />
              <Settings2 size={20} className="text-white" />
              <span className="text-sm">Công cụ</span>
            </div>

            <button onClick={sendMessage} aria-label="Gửi tin nhắn" className="flex gap-3">
              <Mic size={20} className="text-white" />
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
