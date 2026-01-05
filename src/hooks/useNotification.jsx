import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { Client } from "@stomp/stompjs";

const NotificationContext = createContext();

const notificationSound = new Audio("/assets/notification.mp3");

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);

  useEffect(() => {
    if (!user || !user.id) return;

    const client = new Client({
      brokerURL: "ws://localhost:8080/api/ws-chat",
      connectHeaders: {
        userId: user.id.toString(),
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("Connected to WebSocket");
        setStompClient(client); // Khi kết nối xong, lưu vào state để dùng chung

        // Đăng ký nhận tin nhắn trả về cho chính mình
        client.subscribe(`/topic/messages/${user.id}`, (payload) => {
          const message = JSON.parse(payload.body);

          console.log(message);
          setLatestMessage(message);

          const isNotAtChatPage =
            !window.location.pathname.includes("/messages");

          if (isNotAtChatPage) {
            setUnreadCount((prev) => prev + 1);

            notificationSound.currentTime = 0;
            notificationSound.play().catch((err) => {
              console.warn(
                "Âm thanh bị chặn do chính sách Autoplay của trình duyệt:",
                err
              );
            });
          }
        });
      },
    });

    client.activate();

    return () => {
      if (client.active) client.deactivate();
    };
  }, [user]);

  const resetUnreadCount = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, resetUnreadCount, stompClient, latestMessage }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
