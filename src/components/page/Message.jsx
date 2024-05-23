import React, { useState, useEffect } from 'react';
import useAllUserProfile from '../hook/useAllUserProfile';
import MessageList from '../common/MessageList';
import MessageRoom from '../common/MessageRoom';
import { useParams, useNavigate } from 'react-router-dom';
import ChatRoomService from '../service/ChatRoomService';

const Message = () => {
  const { chatRoomId } = useParams();
  const { allUserProfiles } = useAllUserProfile();
  const [chatRoom, setChatRoom] = useState(null); // 채팅방 ID를 저장할 상태
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 저장할 상태
  const [messages, setMessages] = useState([]); // 메시지 상태 추가
  const [chatMessages, setChatMessages] = useState([]);
  const navigate = useNavigate();

  // 채팅방 생성
  const handleSelectedUser = async (selectedUser) => {
    setSelectedUser(selectedUser);

    const chatRoomDTO = {
      userEmails: [selectedUser.email],
    };

    try {
      const response = await ChatRoomService.createChatRoom(chatRoomDTO);
      console.log('채팅방 ID 저장 : ' + response.id);
      setChatRoom(response.id);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

  return (
    <div>
      <MessageList
        chatRoomId={chatRoomId}
        allUserProfiles={allUserProfiles}
        handleSelectedUser={handleSelectedUser}
        messages={messages} 
        setMessages={setMessages}
      />
      <MessageRoom
        chatRoomId={chatRoomId}
        chatRoom={chatRoom}
        allUserProfiles={allUserProfiles}
        selectedUser={selectedUser}
        messages={messages} 
        setMessages={setMessages}
      />
    </div>
  );
};

export default Message;
