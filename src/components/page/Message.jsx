import React, { useEffect, useState } from 'react';
import './Message.css';
import MessageList from '../common/MessageList';
import MessageRoom from '../common/MessageRoom';
import useChatRoom from '../hook/useChatRoom';
import useUser from '../hook/useUser';
import { connect, disconnect } from '../service/ChatWebSocketService';

const Message = () => {
  const { chatRoomId, setMessages, setChatMessageList, fetchChatMessageList } =
    useChatRoom();
  const { isLoggedIn, profileInfo } = useUser();
  const [messageCount, setMessageCount] = useState(0);

  // 웹소켓 연결
  useEffect(() => {
    const onMessageReceived = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const onChatRoomListUpdate = (chatRoomList) => {
      setChatMessageList(chatRoomList);
    };

    const updateMessageCount = (count) => {
      setMessageCount(count);
    };

    connect(
      chatRoomId,
      profileInfo.email,
      onMessageReceived,
      onChatRoomListUpdate,
      updateMessageCount
    );

    return () => {
      disconnect();
    };
  }, [chatRoomId, profileInfo.email, setMessages, setChatMessageList]);

  // 채팅방 리스트 가져오기
  useEffect(() => {
    if (isLoggedIn) {
      fetchChatMessageList();
    }
  }, [isLoggedIn, fetchChatMessageList]);

  return (
    <div>
      <div className="message-count">Messages: {messageCount}</div>
      <MessageList />
      <MessageRoom />
    </div>
  );
};

export default Message;
