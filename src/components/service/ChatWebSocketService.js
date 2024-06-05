import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const socketUrl = 'http://localhost:8088/ws';
let stompClient = null;

export const connect = (
  chatRoomId,
  userEmail,
  onMessageReceived,
  onChatRoomListUpdate
) => {
  const token = localStorage.getItem('token');
  const socket = new SockJS(`${socketUrl}?token=${token}`);

  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => {
      console.log(str);
    },
    onConnect: () => {
      console.log('Connected to WebSocket');

      // 채팅방 구독 설정
      stompClient.subscribe(`/sub/chat/room/${chatRoomId}`, (message) => {
        const chatMessage = JSON.parse(message.body);
        onMessageReceived(chatMessage);
      });

      // 채팅방 리스트 구독 설정
      stompClient.subscribe(`/sub/chatRoomList/${userEmail}`, (message) => {
        const chatRoomList = JSON.parse(message.body);
        console.log("이게 머에요?" + chatRoomList)
        onChatRoomListUpdate(chatRoomList);
      });
    },
    onDisconnect: (frame) => {
      console.log('Disconnected from WebSocket', frame);
    },
    onStompError: (frame) => {
      console.error(`Broker reported error: ${frame.headers.message}`);
      console.error(`Additional details: ${frame.body}`);
    },
  });

  stompClient.activate();
};

// 메시지 보내기
export const sendMessageWithImage = async (
  chatRoomId,
  senderId,
  receiverId,
  messageContent,
  imageUrl
) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error('WebSocket not connected');
    }

    const payload = {
      chatRoomId,
      senderId,
      receiverId,
      messageContent,
      imageUrl,
    };

    console.log('imageUrl :', imageUrl);

    // 메시지와 이미지를 함께 전송
    stompClient.publish({
      destination: `/pub/sendMessage/${chatRoomId}`,
      body: JSON.stringify(payload),
    });

    console.log('Message sent successfully');
  } catch (error) {
    console.error('Failed to send message:', error.message);
  }
};

// WebSocket 연결 해제
export const disconnect = () => {
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
    console.log('Disconnected from WebSocket');
  }
};
