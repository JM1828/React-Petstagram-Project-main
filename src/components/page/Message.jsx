import React, { useState, useEffect } from 'react';
import '../service/polyfill.js';
import './Message.css';
import useAllUser from '../hook/useAllUser';
import MessageList from '../common/MessageList';
import MessageRoom from '../common/MessageRoom';
import ChatRoomService from '../service/ChatRoomService';
import { connect, disconnect } from '../service/ChatWebSocketService.js';
import useUser from '../hook/useUser';
import { useNavigate } from 'react-router-dom';

const Message = () => {
  const { allUserProfiles } = useAllUser();
  const [chatRoomId, setChatRoomId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessageList, setChatMessageList] = useState([]);
  const { profileInfo, getProfileImageUrl } = useUser();
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // 채팅방 리스트 가져오는 함수
  useEffect(() => {
    const fetchChatMessageList = async () => {
      try {
        const response = await ChatRoomService.getChatRoomList();
        // 현재 로그인한 사용자의 ID를 기준으로 필터링
        const filteredChatRooms = await Promise.all(
          response.map(async (chatRoom) => {
            const senderProfileImageUrl = await getProfileImageUrl(
              allUserProfiles.find((user) => user.id === chatRoom.senderId)
                ?.profileImage
            );
            const receiverProfileImageUrl = await getProfileImageUrl(
              allUserProfiles.find((user) => user.id === chatRoom.receiverId)
                ?.profileImage
            );
            return {
              ...chatRoom,
              senderProfileImageUrl,
              receiverProfileImageUrl,
            };
          })
        );

        setChatMessageList(filteredChatRooms);
      } catch (error) {
        console.error('Error fetching chat message list:', error);
      }
    };
    fetchChatMessageList();
  }, [allUserProfiles]);

  // 웹소켓 연결
  useEffect(() => {
    const onMessageReceived = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const onChatRoomListUpdate = (chatRoomList) => {
      setChatMessageList(chatRoomList);
    };

    connect(
      chatRoomId,
      profileInfo.email,
      onMessageReceived,
      onChatRoomListUpdate
    );

    return () => {
      disconnect();
    };
  }, [chatRoomId, profileInfo.email]);

  // 채팅방 생성
  const handleSelectedUser = async (selectedUser) => {
    setSelectedUser(selectedUser);

    // 기존 채팅방이 있는지 확인
    const existingChatRoom = chatMessageList.find(
      (room) =>
        (room.senderId === profileInfo.id &&
          room.receiverId === selectedUser.id) ||
        (room.senderId === selectedUser.id &&
          room.receiverId === profileInfo.id)
    );

    if (existingChatRoom) {
      // 이미 존재하는 채팅방으로 이동
      setChatRoomId(existingChatRoom.id);
      navigate(`/messages/${existingChatRoom.id}`);
    } else {
      // 새로운 채팅방 생성
      const chatRoomDTO = {
        senderId: profileInfo.id,
        receiverId: selectedUser.id,
      };

      try {
        const response = await ChatRoomService.createChatRoom(chatRoomDTO);
        setChatRoomId(response.id);
        navigate(`/messages/${response.id}`);
      } catch (error) {
        console.error('채팅방 생성 실패:', error);
      }
    }
  };

  // 서버에서 채팅방의 메시지 내역과 정보를 함께 가져오기
  const handleUserClick = async (chatRoomId) => {
    try {
      const response = await ChatRoomService.chatRoomMessagesWithInfo(
        chatRoomId
      );

      // 메시지 설정
      setMessages(response.messages);

      // 채팅방 정보에서 발신자와 수신자 정보 설정
      const isSender = response.senderId === profileInfo.id;
      const selectedUser = isSender
        ? allUserProfiles.find((user) => user.id === response.receiverId)
        : allUserProfiles.find((user) => user.id === response.senderId);

      // 선택된 사용자 정보와 채팅방 ID 설정
      setSelectedUser(selectedUser);
      setChatRoomId(chatRoomId);
      navigate(`/messages/${chatRoomId}`);
    } catch (error) {
      console.error('Error fetching messages and chat room info:', error);
    }
  };

  return (
    <div>
      <MessageList
        allUserProfiles={allUserProfiles}
        profileInfo={profileInfo}
        handleSelectedUser={handleSelectedUser}
        setSelectedUser={setSelectedUser}
        selectedUser={selectedUser}
        chatMessageList={chatMessageList}
        handleUserClick={handleUserClick}
      />
      <MessageRoom
        selectedUser={selectedUser}
        chatRoomId={chatRoomId}
        profileInfo={profileInfo}
        messages={messages}
      />
    </div>
  );
};

export default Message;
