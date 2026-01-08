import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Phone,
  Video,
  Info,
  MoreHorizontal,
  MessageSquare,
  CheckCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import { useNotification } from "../../hooks/useNotification";

export const ChatMessagePage = () => {
  const { user } = useAuth();
  const { callApi } = useApi();
  const { stompClient, latestMessage, resetUnreadCount } = useNotification();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const scrollRef = useRef(null);

  useEffect(() => {
    const initConversations = async () => {
      resetUnreadCount();
      try {
        const res = await callApi("get", `/chat/conversations/${user.id}`);
        if (res.success) setConversations(res.data);
      } catch (err) {
        console.error("Lỗi tải danh sách hội thoại:", err);
      }
    };
    if (user?.id) initConversations();
  }, [user?.id]);

  useEffect(() => {
    if (!latestMessage) return;

    const handleNewMessage = async () => {
      const partnerId =
        String(latestMessage.senderId) === String(user.id)
          ? latestMessage.receiverId
          : latestMessage.senderId;

      const existingUserIdx = conversations.findIndex(
        (c) => String(c.userId) === String(partnerId)
      );

      if (existingUserIdx !== -1) {
        const updatedList = [...conversations];
        const updatedUser = {
          ...updatedList[existingUserIdx],
          lastMessage: latestMessage.content,
          timestamp: latestMessage.timestamp,
        };
        updatedList.splice(existingUserIdx, 1);
        setConversations([updatedUser, ...updatedList]);
      } else {
        try {
          const res = await callApi("get", `/chat/summary/${partnerId}`);
          if (res.success) {
            const newUser = {
              ...res.data,
              lastMessage: latestMessage.content,
              timestamp: latestMessage.timestamp,
              unreadCount: 1,
            };
            setConversations((prev) => [newUser, ...prev]);
          }
        } catch (err) {
          console.error("Lỗi lấy thông tin người mới:", err);
        }
      }

      if (String(partnerId) === String(selectedUser?.userId)) {
        setMessages((prev) => [...prev, latestMessage]);
      }
    };

    handleNewMessage();
  }, [latestMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectUser = async (targetUser) => {
    setSelectedUser(targetUser);
    try {
      const res = await callApi(
        "get",
        `/chat/${user.id}/to/${targetUser.userId}`
      );
      if (res.success) setMessages(res.data);
    } catch (err) {
      console.error("Lỗi lấy lịch sử chat:", err);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !stompClient || !selectedUser) return;

    const chatMessage = {
      senderId: user.id,
      receiverId: selectedUser.userId,
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
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden font-sans border-t border-gray-100">
      <div className="w-full md:w-[350px] lg:w-[420px] border-r flex flex-col flex-none">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Đoạn chat
            </h1>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 && (
            <div className="text-center py-10 opacity-40 italic text-sm">
              Chưa có cuộc trò chuyện nào.
            </div>
          )}
          {conversations.map((chat) => (
            <div
              key={chat.userId}
              onClick={() => handleSelectUser(chat)}
              className={`flex items-center gap-3 px-3 py-4 cursor-pointer rounded-2xl transition-all duration-200 ${
                selectedUser?.userId === chat.userId
                  ? "bg-indigo-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="relative flex-none">
                <img
                  src={
                    chat.imageUrl ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                  alt=""
                />
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-bold text-gray-900 truncate text-[15px]">
                    {chat.fullName}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(chat.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${
                    chat.unreadCount > 0
                      ? "font-bold text-gray-900"
                      : "text-gray-500 opacity-80"
                  }`}
                >
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      selectedUser.imageUrl ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    className="w-11 h-11 rounded-2xl object-cover shadow-sm"
                    alt=""
                  />
                  {selectedUser.online && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 leading-none mb-1">
                    {selectedUser.fullName}
                  </h3>
                  <span className="text-[11px] text-green-600 font-bold uppercase tracking-wider italic">
                    Trực tuyến
                  </span>
                </div>
              </div>
              <div className="flex gap-1 text-indigo-600">
                <button className="p-3 hover:bg-indigo-50 rounded-xl transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-3 hover:bg-indigo-50 rounded-xl transition-colors">
                  <Video size={20} />
                </button>
                <button className="p-3 hover:bg-indigo-50 rounded-xl transition-colors">
                  <Info size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {messages.map((msg, idx) => {
                const isMe = String(msg.senderId) === String(user.id);
                return (
                  <div
                    key={idx}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    } animate-in fade-in`}
                  >
                    <div
                      className={`max-w-[70%] p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <div className="p-5 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border-2 border-transparent focus-within:border-indigo-600 focus-within:bg-white transition-all shadow-inner">
                <input
                  className="bg-transparent border-none focus:ring-0  outline-none flex-1 text-sm font-medium px-4"
                  placeholder="Viết tin nhắn cho khách hàng..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-all active:scale-95"
                >
                  <Send size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-700 bg-gray-50/50">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-100 rotate-12">
              <MessageSquare size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Chào mừng quay lại!
            </h2>
            <p className="text-gray-500 mt-2 max-w-sm font-medium leading-relaxed">
              Chọn một khách hàng bên trái để bắt đầu tư vấn Tour & Khách sạn
              trực tuyến.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
