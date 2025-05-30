"use client";
import React, { useRef, useState, useEffect } from "react";
import { Plus, Settings2, Mic, Send, Copy, RefreshCw, History, Sidebar, X, Volume2, Edit2, Languages, Check } from "lucide-react";
import axios from "axios";
import { SessionStorage } from "@/storage/sessionStorage";
import { useSidebarStore } from "@/storage/sidebarState";

type Message = {
  role: "user" | "bot";
  content: string;
  translatedContent?: string;
  audioUrl?: string;
};

interface User {
  username: string;
  email: string;
  token: string;
}

export default function Main() {
  const { toggle } = useSidebarStore();
  const cancelAudioRef = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [topic, setTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const topicInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioCurrent, setAudioCurrent] = useState<string | null>(null);
  const playAudioRef = useRef<HTMLAudioElement | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Danh sách gợi ý chủ đề
  const suggestedTopics = [
    "Ước mơ và mục tiêu",
    "Sở thích và đam mê",
    "Thảo luận về công nghệ",
    "Giao tiếp hàng ngày",
    "Chuẩn bị phỏng vấn",
    "Chia sẻ kinh nghiệm du lịch",
    "Tìm hiểu về văn hóa",
  ];

  useEffect(() => {
    const storedUser = SessionStorage.getUser();
    setUser(storedUser);
  }, []);

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => console.log("Đã sao chép nội dung!"),
      (err) => console.error("Lỗi khi sao chép:", err)
    );
  };

  const sendMessage = async (prompt?: string, isRegenerate: boolean = false) => {
    const inputPrompt = prompt || topic.trim();
    if (!inputPrompt) return;

    if (isRegenerate) {
      setMessages((prev) => prev.slice(0, -1));
    }

    setIsThinking(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/communicate`,
        {
          prompt: inputPrompt,
          history: messages.slice(-20),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status !== 200) throw new Error("Lỗi API");

      const botMessage: Message = {
        role: "bot",
        content: res.data.script || "Không có phản hồi.",
        translatedContent: res.data.translatedScript || "",
        audioUrl: res.data.audioUrl || "",
      };

      if (res.data.audioUrl) {
        playAudio(res.data.audioUrl);
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      const botMessage: Message = {
        role: "bot",
        content: isRegenerate
          ? "Lỗi khi tạo lại phản hồi, vui lòng thử lại."
          : "Lỗi khi lấy phản hồi, vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const regenerateMessage = () => {
    if (playAudioRef.current) {
      playAudioRef.current.pause();
      playAudioRef.current.src = "";
      playAudioRef.current = null;
      setAudioCurrent(null);
    }
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isRecording && topic.trim() !== "") {
      e.preventDefault();
      handleTopic(topic.trim());
      sendMessage();
    }
  };

  const handleTopic = (topic: string) => {
    const userMessage: Message = { role: "user", content: topic };
    setMessages((prev) => [...prev, userMessage]);
    setTopic("");
    setSelectedTopic(topic);
  }

  const translateMessage = async (message: Message) => {
    if (!message.content) return;
    setMessage(message);
    setShowTranslated(true);
  }

  const startRecording = async () => {
    if (playAudioRef.current) {
      playAudioRef.current.pause();
      playAudioRef.current.src = "";
      playAudioRef.current = null;
      setAudioCurrent(null);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        if (cancelAudioRef.current) {
          cancelAudioRef.current = false;
          return;
        }
        setIsProcessingAudio(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audioFile", audioBlob, "recording.webm");

        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/audio`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (res.status !== 200) throw new Error("Lỗi chuyển đổi âm thanh");

          const transcribedText = res.data.text || "";
          if (transcribedText) {
            setIsProcessingAudio(false);
            const userMessage: Message = {
              role: "user",
              content: transcribedText,
              audioUrl: URL.createObjectURL(audioBlob),
            };
            setMessages((prev) => [...prev, userMessage]);
            await sendMessage(transcribedText);
          } else {
            setMessages((prev) => [
              ...prev,
              { role: "bot", content: "Không thể chuyển đổi âm thanh thành văn bản." },
            ]);
          }
        } catch (error) {
          console.error("Lỗi khi gửi âm thanh:", error);
          setMessages((prev) => [
            ...prev,
            { role: "bot", content: "Lỗi khi xử lý âm thanh, vui lòng thử lại." },
          ]);
        } finally {
          setIsProcessingAudio(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Lỗi khi truy cập micro:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Lỗi khi truy cập micro, vui lòng kiểm tra quyền truy cập." },
      ]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      cancelAudioRef.current = true;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      audioChunksRef.current = [];
      setIsRecording(false);
    }
  };

  const changeTopic = () => {
    setMessages([]); // Xóa lịch sử tin nhắn
    setSelectedTopic(null); // Reset chủ đề
    setTopic(""); // Xóa nội dung ô input
    audioChunksRef.current = []; // Xóa dữ liệu audio
  };

  const playAudio = (audioUrl?: string) => {
    if (playAudioRef.current) {
      playAudioRef.current.pause();
      playAudioRef.current.src = "";
      playAudioRef.current = null;
      setAudioCurrent(null);
    }
    if (!audioUrl) {
      console.error("Không có URL âm thanh để phát");
      return;
    }
    const audio = new Audio(audioUrl);
    playAudioRef.current = audio; // Lưu audio mới vào ref
    setAudioCurrent(audioUrl);
    audio.play().catch((err) => console.error("Lỗi phát âm thanh:", err));
    audio.onended = () => {
      setAudioCurrent(null);
      playAudioRef.current = null;
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, isProcessingAudio]);

  return (
    <div className="w-full flex flex-col h-screen text-white overflow-hidden">
      <div className="fixed top-0 left-0 w-full bg-[#111111]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
            <Sidebar size={24} />
          </button>
          <div className="text-xl font-semibold">Communicate with AI</div>
          <button className="text-gray-200 hover:text-white" onClick={() => console.log("History")}>
            <History size={24} />
          </button>
        </div>
        <div className="text-center text-sm text-gray-400 mt-1 mb-1">Learning by AI</div>
      </div>

      <div className="mt-[82px] mb-[100px] flex-1 flex flex-col px-4 py-4 overflow-y-auto h-full space-y-4 custom-scroll bg-[#111111] pb-7">
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center h-[360px] items-center text-center text-gray-400 flex-grow">
            <h1 className="text-2xl font-medium mb-2">Chào {user?.username ? user.username : "bạn"}?</h1>
            <h1 className="text-2xl font-medium">Chọn chủ đề để bắt đầu nói chuyện nào?</h1>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Gợi ý chủ đề:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleTopic(topic);
                      sendMessage(topic);
                    }}
                    className="px-3 py-1 bg-[#323232d9] rounded-lg text-sm text-white hover:bg-[#4a4a4a]"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex-col whitespace-pre-line flex items-start ${msg.role === "user"
                ? "rounded-3xl p-3 pt-2 pb-2 max-w-[70%] bg-[#323232d9] self-end text-white"
                : "p-1 self-start text-gray-300"
                }`}
            >
              <div className={`flex-1 whitespace-pre-line ${msg.role === "user" ? 'break-words' : ''}`}>{msg.content}</div>
              <div className="flex gap-2">
                {msg.audioUrl && (
                  <button
                    onClick={() => playAudio(msg.audioUrl)}
                    aria-label="Phát âm thanh"
                    className={`p-1 hover:text-white mt-2 ${audioCurrent === msg.audioUrl ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    <Volume2 size={16} />
                  </button>
                )}
                {msg.translatedContent && (
                  <button
                    onClick={() => translateMessage(msg)}
                    aria-label="Phát âm thanh"
                    className={`p-1 hover:text-white text-gray-400 mt-2 pb-0}`}
                  >
                    <Languages size={16} />
                  </button>
                )}

              </div>
              {msg.role === "bot" && idx === messages.length - 1 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    aria-label="Sao chép tin nhắn"
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={regenerateMessage}
                    aria-label="Tạo lại phản hồi"
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {isThinking && (
          <div className="p-1 self-start text-gray-400 italic">
            Đang suy nghĩ câu trả lời...
          </div>
        )}
        {isProcessingAudio && (
          <div className="p-1 self-start text-gray-400 italic">
            Đang xử lý âm thanh...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#171717] p-6 rounded-xl shadow-lg border border-[#262626] flex flex-col items-center">
            <div className="flex items-center mb-4">
              <Mic size={24} className="text-red-500 animate-pulse mr-2" />
              <span className="text-lg text-white">Đang ghi âm...</span>
            </div>
            <div className="flex gap-3 w-full text-sm justify-center text-center mt-2">
              <button
                onClick={cancelRecording}
                className="justify-center w-[100px] bg-red-500 hover:bg-red-600 text-white py-2 px-2 rounded-lg flex items-center"
              >
                <X size={16} className="mr-2" />
                Hủy
              </button>
              <button
                onClick={stopRecording}
                className="justify-center w-[100px] bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-lg flex items-center"
              >
                <Send size={16} className="mr-2" />
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {showTranslated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[80%] md:w-[768px] bg-[#171717] p-5 rounded-xl shadow-lg border border-[#262626] flex flex-col items-center">
            <div className="flex w-full items-center mb-2">
              <span className="text-sm w-full text-white">{message?.translatedContent}</span>
            </div>
            <div className="flex gap-3 w-full text-xs justify-end text-center mt-2">
              <button
                onClick={() => setShowTranslated(false)}
                className="justify-center w-[100px] bg-[#202020] hover:bg-[#2c2c2c] text-white py-2 px-2 rounded-lg flex items-center"
              >
                <Check size={14} className="mr-1" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 w-full md:w-[768px] z-10 px-3 py-2 bg-[#111111]">
        <div className="flex flex-col items-end gap-4 bg-[#202020] rounded-2xl px-4 py-2">
          <div className="flex-1 w-full">
            {selectedTopic ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-white text-base p-2">{selectedTopic}</span>
                <button
                  onClick={changeTopic}
                  aria-label="Thay đổi chủ đề"
                  className="p-2 bg-[#323232d9] rounded-lg text-sm text-white hover:bg-[#4a4a4a] flex items-center"
                >
                  <Edit2 size={16} className="" />
                  <p className="hidden md:inline md:ml-2">Thay đổi chủ đề</p>
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={topicInputRef}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập chủ đề bạn muốn giao tiếp cùng AI..."
                  className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-base p-2"
                />
                {/* {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedTopics.map((suggestedTopic, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleTopic(suggestedTopic);
                          sendMessage(suggestedTopic);
                        }}
                        className="px-3 py-1 bg-[#323232d9] rounded-lg text-sm text-white hover:bg-[#4a4a4a]"
                      >
                        {suggestedTopic}
                      </button>
                    ))}
                  </div>
                )} */}
              </>
            )}
          </div>
          <div className="flex w-full justify-between pb-1">
            <div className="flex gap-2">
              <Plus size={20} className="text-white" />
              <Settings2 size={20} className="text-white" />
              <span className="text-sm">Công cụ</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startRecording}
                aria-label="Bắt đầu ghi âm"
                className="text-white"
                disabled={isRecording}
              >
                <Mic
                  size={20}
                  className={isRecording ? "text-gray-500" : "text-white"}
                />
              </button>
              {!selectedTopic && (
                <button onClick={() => {
                  if (topic.trim() === "") return;
                  handleTopic(topic.trim());
                  sendMessage()
                }} aria-label="Gửi tin nhắn" className="flex gap-3">
                  <Send size={20} className="text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}