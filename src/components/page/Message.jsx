import React, { useState } from 'react';
import './Message.css';
import useAllUser from '../hook/useAllUser';
import MessageList from '../common/MessageList';
import MessageRoom from '../common/MessageRoom';
import ChatRoomService from '../service/ChatRoomService';
import useUser from '../hook/useUser';
import { useNavigate } from 'react-router-dom';

const Message = () => {
  const { allUserProfiles } = useAllUser();
  const [chatRoomId, setChatRoomId] = useState(null); // 채팅방 ID를 저장할 상태
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 저장할 상태
  const { profileInfo } = useUser();
  const navigate = useNavigate();

  // 채팅방 생성
  const handleSelectedUser = async (user) => {
      setSelectedUser(user);
      
      const chatRoomDTO = {
          senderId: profileInfo.id, // 현재 로그인한 사용자의 ID
          id: user.id, // 선택된 사용자의 ID
        };
        
        try {
            const response = await ChatRoomService.createChatRoom(chatRoomDTO);
            setChatRoomId(response.chatRoomId);
            navigate(`/messages/${response.chatRoomId}`);
        } catch (error) {
            console.error('채팅방 생성 실패:', error);
        }
    };
    
    // 선택된 채팅방 정보 불러오기
    const handleUserClick = async (chatRoomId) => {
        setChatRoomId(chatRoomId);
        console.log("현재로그인한 사용자" + profileInfo);
        
    try {
      const response = await ChatRoomService.getChatRoomById(chatRoomId);
      setSelectedUser(response);
      navigate(`/messages/${chatRoomId}`);
    } catch (error) {
      console.error('Error fetching chat room user:', error);
    }
  };

  return (
    <div>
      <MessageList
        allUserProfiles={allUserProfiles}
        handleSelectedUser={handleSelectedUser}
        handleUserClick={handleUserClick}
        profileInfo={profileInfo}
      />
      <MessageRoom
        selectedUser={selectedUser}
        chatRoomId={chatRoomId}
        profileInfo={profileInfo}
      />
    </div>
  );
};

export default Message;

