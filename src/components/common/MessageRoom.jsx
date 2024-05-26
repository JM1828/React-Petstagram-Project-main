import React, { useState, useEffect } from 'react';
import './MessageRoom.css';
import ChatRoomService from '../service/ChatRoomService';
import { useNavigate } from 'react-router-dom';

const MessageRoom = ({ selectedUser, chatRoomId }) => {
  const [messageContent, setMessageContent] = useState(''); // 메시지 입력 상태 관리
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // 채팅방의 메시지 내역 가져오기
  useEffect(() => {
    if (!chatRoomId) return;
    const fetchMessages = async () => {
      try {
        const response = await ChatRoomService.chatRoomMessages(chatRoomId);
        setMessages(response.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  // 메시지 입력 핸들러
  const handleMessageChange = (event) => {
    setMessageContent(event.target.value);
  };

  // onKeyDown 이벤트 핸들러를 추가, Enter 키로 메시지 전송
  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      await sendMessage();
    }
  };

  // 메시지 전송 핸들러
  const sendMessage = async () => {
    if (messageContent.trim() === '') return;

    const messageData = {
      chatRoomId: chatRoomId,
      receiverId: selectedUser.id,
      messageContent: messageContent,
    };

    try {
      const response = await ChatRoomService.sendMessage(messageData);
      console.log('메시지 전송 결과:', response);

      // 새로운 메시지를 메시지 목록에 추가
      setMessages((prevMessages) => [...prevMessages, response]);

      // console.log(selectedUser);
      setMessageContent('');
      navigate(`/messages/${chatRoomId}`);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  return (
    <div className="messageroom">
      <div className="user_container">
        <img
          className="profile_image1"
          src={selectedUser?.profileImageUrl}
          alt="Profile"
        />
        <div className="user_name_one">{selectedUser?.name}</div>
        <img
          className="profile_detail"
          src="../src/assets/message/material-symbols_info-outline.png"
          alt="Info Icon"
        />
      </div>

      <div className="user_info">
        <img
          className="profile_image2"
          src={selectedUser?.profileImageUrl}
          alt="Profile"
        />
        <div className="user_name_two">{selectedUser?.name}</div>
        <div className="user_status">{selectedUser?.email} • petstagram</div>
        <button className="profile_btn">프로필 보기</button>
      </div>

      <div className="message_list">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`text ${
              msg.senderId === msg.receiverId ? 'sent' : 'received'
            }`}
          >
            {msg.messageContent}
          </div>
        ))}
      </div>

      <div className="input_section">
        <img
          className="smile_icon"
          src="../src/assets/message/smile.png"
          alt="smile icon"
        />
        <input
          type="text"
          className="input_message"
          placeholder="메시지 입력 .."
          value={messageContent}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
        />
        <img
          className="mic_icon"
          src="../src/assets/message/bi_mic.png"
          alt="mic icon"
        />
        <img
          className="image_icon"
          src="../src/assets/message/mynaui_image.png"
          alt="image icon"
        />
      </div>
    </div>
  );
};

export default MessageRoom;
