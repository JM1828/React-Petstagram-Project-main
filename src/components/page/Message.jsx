import React, { useState, useEffect } from 'react';
import useAllUserProfile from '../hook/useAllUserProfile';
import MessageList from '../common/MessageList';
import MessageRoom from '../common/MessageRoom';
import ChatRoomService from '../service/ChatRoomService';
import useUserProfile from '../hook/useUserProfile';
import { useNavigate } from 'react-router-dom';

const Message = () => {
  const { allUserProfiles } = useAllUserProfile();
  const [chatRoomId, setChatRoomId] = useState(null); // 채팅방 ID를 저장할 상태
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 저장할 상태
  const [chatSelectedUser, setChatSelectedUser] = useState(null);
  const { profileInfo } = useUserProfile();
  const navigate = useNavigate();

  // 채팅방 생성
  const handleSelectedUser = async (user) => {
    console.log('채팅방 생성 유저' + user);
    console.log('현재 로그인한 유저' + profileInfo.id);
    setSelectedUser(user);

    const chatRoomDTO = {
      senderId: profileInfo.id, // 현재 로그인한 사용자의 ID
      receiverId: user.id, // 선택된 사용자의 ID
    };

    try {
      const response = await ChatRoomService.createChatRoom(chatRoomDTO);
      setChatRoomId(response.id);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

  // 선택된 채팅방 정보 불러오기
  const handleUserClick = async (chatRoomId) => {
    setChatRoomId(chatRoomId);

    try {
      const response = await ChatRoomService.getChatRoomById(chatRoomId);
      console.log('선택된 유저' + response);
      setChatSelectedUser(response);
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
      <MessageRoom selectedUser={selectedUser} chatRoomId={chatRoomId} chatSelectedUser={chatSelectedUser} />
    </div>
  );
};

export default Message;
