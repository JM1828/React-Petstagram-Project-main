import React, { useState } from 'react';
import useAllUserProfile from '../hook/useAllUserProfile';
import MessageList from '../common/MessageList';
import MessageRoom from '../common/MessageRoom';
import ChatRoomService from '../service/ChatRoomService';

const Message = () => {
  const { allUserProfiles } = useAllUserProfile();
  const [chatRoom, setChatRoom] = useState(null); // 채팅방 ID를 저장할 상태
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 저장할 상태

  // 사용자 선택후 채팅방 생성
  const handleSelectedUser = async (selectedUser) => {
    console.log('선택된 사용자:', selectedUser);
    setSelectedUser(selectedUser); // 선택된 사용자 저장

    const chatRoomDTO = {
      userEmails: [selectedUser.email],
    };

    try {
      const response = await ChatRoomService.createChatRoom(chatRoomDTO);
      setChatRoom(response.id); // 채팅방 정보 저장
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

  return (
    <div>
      <MessageList
        allUserProfiles={allUserProfiles}
        handleSelectedUser={handleSelectedUser}
        setChatRoom={setChatRoom}
      />
      <MessageRoom
        chatRoom={chatRoom}
        allUserProfiles={allUserProfiles}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default Message;
