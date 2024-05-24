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
  const [chatRoomMessages, setChatRoomMessages] = useState([]);
  const navigate = useNavigate();

  // 채팅방 생성
  const handleSelectedUser = async (selectedUser) => {
    setSelectedUser(selectedUser);

    const chatRoomDTO = {
      userEmails: [selectedUser.email],
    };

    try {
      const response = await ChatRoomService.createChatRoom(chatRoomDTO);
      console.log('채팅방 ID 저장 : ' + response);
      setChatRoom(response.id);
      navigate(`/messages/${response.id}`);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

  // chatRoomId가 변경될 때 메시지 불러오기
  useEffect(() => {
    const fetchChatRoomMessages = async () => {
      try {
        if (chatRoomId) {
          const response  = await ChatRoomService.chatRoomMessages(chatRoomId);
          console.log("채팅 목록" + response);
          setMessages(response);
        }
      } catch (error) {
        console.error('메시지 내역 불러오기 실패:', error);
      }
    };

    fetchChatRoomMessages();
  }, []);

  return (
    <div>
      <MessageList
        chatRoom={chatRoom}
        allUserProfiles={allUserProfiles}
        handleSelectedUser={handleSelectedUser}
        messages={messages}
        setMessages={setMessages}
      />
      <MessageRoom
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
