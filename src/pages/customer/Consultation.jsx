import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MessageSquare,
  Phone,
  MoreHorizontal,
  CheckCheck,
  Mail,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import { useNotification } from "../../hooks/useNotification";

export const ConsultationPage = () => {
  // 1. Hooks & Context
  const { user } = useAuth();
  const { callApi } = useApi();
  const { stompClient, latestMessage } = useNotification();

  // 2. States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);

  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedChat || !user?.id) return;

      setIsHistoryLoading(true);
      try {
        const response = await callApi(
          "get",
          `/chat/${user.id}/to/${selectedChat.userId}`
        );

        if (response.success) {
          setMessages(response.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch sử tin nhắn:", err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchChatHistory();
  }, [selectedChat?.userId, user?.id]);

  // 4. Xử lý nhận tin nhắn thời gian thực (WebSocket)
  useEffect(() => {
    if (latestMessage) {
      const isFromPartner =
        String(latestMessage.senderId) === String(selectedChat?.userId);
      const isFromMe = String(latestMessage.senderId) === String(user?.id);

      if (isFromPartner || isFromMe) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m.content === latestMessage.content &&
              Math.abs(
                new Date(m.timestamp) - new Date(latestMessage.timestamp)
              ) < 1000
          );
          if (isDuplicate) return prev;
          return [...prev, latestMessage];
        });
      }
    }
  }, [latestMessage, selectedChat?.userId, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Các hàm xử lý sự kiện
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await callApi(
        "get",
        `/chat/check-status?email=${searchTerm}`
      );

      if (response.success) {
        setSelectedChat(response.data);
        setMessages([]);
      } else {
        setError("Không tìm thấy tư vấn viên với email này.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !stompClient || !selectedChat) return;

    const chatMessage = {
      senderId: user.id,
      receiverId: selectedChat.userId,
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(chatMessage),
    });

    setMessages((prev) => [...prev, chatMessage]);
    setMessageInput("");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="min-w-[60vw] max-w-6xl h-[75vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        {!selectedChat ? (
          /* --- MÀN HÌNH CHỜ / TÌM KIẾM --- */
          <div className="flex-1 flex flex-col items-center justify-center px-6 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200 rotate-12 hover:rotate-0 transition-transform duration-300">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight text-center">
              Trung tâm Tư vấn
            </h2>
            <p className="text-gray-500 mb-10 text-center max-w-sm leading-relaxed">
              Nhập email của chuyên gia <b>TravelMate</b> để bắt đầu cuộc trò
              chuyện trực tuyến.
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-md space-y-4">
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isLoading ? "text-indigo-500" : "text-gray-400"
                  }`}
                />
                <input
                  type="email"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setError(null);
                  }}
                  placeholder="vi-du: tuvanvien@travelmate.com"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all ${
                    error
                      ? "border-red-200 focus:border-red-500"
                      : "border-transparent focus:border-indigo-600 focus:bg-white"
                  }`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-semibold px-2 animate-pulse">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <button
                disabled={isLoading || !searchTerm.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Kết nối ngay"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-2.5 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="relative">
                  <img
                    src={
                      selectedChat.imageUrl ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                    alt="avatar"
                  />
                  {selectedChat.online && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full animate-pulse"></span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-gray-900 leading-tight">
                    {selectedChat.fullName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        selectedChat.online ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {selectedChat.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`tel:${selectedChat.phoneNumber}`}
                  className="p-3 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
                >
                  <Phone size={20} />
                </a>
                <button className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] space-y-6 scroll-smooth">
              {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p className="text-sm">Đang tải cuộc trò chuyện...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 opacity-40">
                  <p className="text-sm italic">
                    Bắt đầu gửi tin nhắn để nhận tư vấn từ chuyên gia
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = String(msg.senderId) === String(user.id);
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      } animate-in fade-in slide-in-from-top-1`}
                    >
                      <div className="max-w-[70%] group">
                        <div
                          className={`p-4 rounded-[1.5rem] shadow-sm text-sm leading-relaxed ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-indigo-50"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div
                          className={`flex items-center gap-1 mt-1.5 px-1 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && (
                            <CheckCheck size={12} className="text-indigo-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[1.5rem] border-2 border-transparent focus-within:border-indigo-600 focus-within:bg-white transition-all duration-300 shadow-inner">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Aa... Nhập tin nhắn tư vấn"
                  className="flex-1 bg-transparent text-sm font-medium px-4 py-2 border-none outline-none focus:ring-0"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isHistoryLoading}
                  className="bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg shadow-indigo-100 active:scale-90"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
