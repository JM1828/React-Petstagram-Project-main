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
  const navigate = useNavigate();

  // // 채팅 목록
  // useEffect(() => {
  //   const fetchChatRoomData = async () => {
  //     try {
  //       const chatMessages = await ChatRoomService.addUserToChatRoom(
  //         chatRoomId
  //       );
  //       console.log('채팅 메시지 목록 : ' + chatMessages.messages);
  //       setMessages(chatMessages.messages);
  //     } catch (error) {
  //       console.error('메시지 내역 불러오기 실패:', error);
  //     }
  //   };

  //   if (chatRoomId) {
  //     fetchChatRoomData();
  //   }
  // }, [chatRoomId]); // chatRoom ID가 변경될 때마다 실행

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
      // navigate(`/messages/${response.id}`);
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
        messages={messages} // 메시지 상태 전달
      />
      <MessageRoom
        chatRoom={chatRoom}
        chatRoomId={chatRoomId}
        allUserProfiles={allUserProfiles}
        selectedUser={selectedUser} // 선택된 사용자 상태 전달
        messages={messages} // 메시지 상태 전달
        setMessages={setMessages} // 메시지 상태 업데이트 함수 전달
      />
    </div>
  );
};

export default Message;
