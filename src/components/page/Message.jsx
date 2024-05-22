import React, { useState, useEffect } from 'react';
import useAllUserProfile from '../hook/useAllUserProfile';
import MessageList from '../common/MessageList';
import MessageRoom from '../common/MessageRoom';
import ChatRoomService from '../service/ChatRoomService';

const Message = () => {
  const { allUserProfiles } = useAllUserProfile();
  const [chatRoom, setChatRoom] = useState(null); // 채팅방 ID를 저장할 상태
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 저장할 상태
  const [messages, setMessages] = useState([]); // 메시지 상태 추가

  // 사용자 선택후 채팅방 생성
  const handleSelectedUser = async (selectedUser) => {
    console.log('선택된 사용자:', selectedUser);
    setSelectedUser(selectedUser); // 선택된 사용자 저장

    const chatRoomDTO = {
      userEmails: [selectedUser.email],
    };

    try {
      const response = await ChatRoomService.createChatRoom(chatRoomDTO);
      setChatRoom(response.id); // 채팅방 ID 저장
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

  // useEffect(() => {
  //   const fetchChatHistory = async () => {
  //     if (chatRoom) {
  //       try {
  //         const chatMessages = await ChatRoomService.addUserToChatRoom(chatRoom);
  //         console.log("채팅 메시지 목록 : " + chatMessages)
  //         // chatMessages가 배열인지 확인 후 배열이 아닌 경우 빈 배열로 설정
  //         setChatHistory(Array.isArray(chatMessages) ? chatMessages : []);
  //       } catch (error) {
  //         console.error('메시지 내역 불러오기 실패:', error);
  //       }
  //     }
  //   };
  
  //   fetchChatHistory();
  // }, [chatRoom]); // chatRoom ID가 변경될 때마다 실행

  return (
    <div>
      <MessageList
        allUserProfiles={allUserProfiles}
        handleSelectedUser={handleSelectedUser}
        messages={messages} // 메시지 상태 전달
      />
      <MessageRoom
        chatRoom={chatRoom}
        allUserProfiles={allUserProfiles}
        selectedUser={selectedUser} // 선택된 사용자 상태 전달
        messages={messages} // 메시지 상태 전달
        setMessages={setMessages} // 메시지 상태 업데이트 함수 전달
      />
    </div>
  );
};

export default Message;
