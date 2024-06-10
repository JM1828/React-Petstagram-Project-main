import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import '../components/service/polyfill.js';
import ChatRoomService from '../components/service/ChatRoomService';
import {
  connect,
  disconnect,
} from '../components/service/ChatWebSocketService';
import { UserContext } from './UserContext';
import { AllUserContext } from './AllUserContext';

const ChatRoomContext = createContext();

export const ChatRoomProvider = ({ children }) => {
  const { isLoggedIn, profileInfo, getProfileImageUrl } =
    useContext(UserContext);
  const { allUserProfiles } = useContext(AllUserContext);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessageList, setChatMessageList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [receivedMessageCount, setReceivedMessageCount] = useState(0);

  // 채팅방 리스트 가져오는 함수
  const fetchChatMessageList = useCallback(async () => {
    try {
      const response = await ChatRoomService.getChatRoomList();
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
      const totalReceivedMessages = filteredChatRooms.reduce(
        (total, room) => total + room.countReceivedMessages,
        0
      );
      setReceivedMessageCount(totalReceivedMessages);
    } catch (error) {
      console.error('채팅방 리스트를 가져오는 중 오류 발생:', error);
    }
  }, [allUserProfiles, getProfileImageUrl]);

  // 채팅방 생성 또는 기존 채팅방으로 이동
  const handleSelectedUser = useCallback(
    async (selectedUser) => {
      setSelectedUser(selectedUser);

      const existingChatRoom = chatMessageList.find(
        (room) =>
          (room.senderId === profileInfo.id &&
            room.receiverId === selectedUser.id) ||
          (room.senderId === selectedUser.id &&
            room.receiverId === profileInfo.id)
      );

      if (existingChatRoom) {
        console.log('동일한 채팅방 ID' + existingChatRoom.id);
        try {
          const response = await ChatRoomService.chatRoomMessagesWithInfo(
            existingChatRoom.id
          );
          setMessages(response.messages);
          setChatRoomId(existingChatRoom.id);
          return existingChatRoom.id;
        } catch (error) {
          console.error('메시지 내역 가져오기 실패:', error);
        }
      } else {
        const chatRoomDTO = {
          senderId: profileInfo.id,
          receiverId: selectedUser.id,
        };
        try {
          const response = await ChatRoomService.createChatRoom(chatRoomDTO);
          setChatRoomId(response.id);
          return response.id;
        } catch (error) {
          console.error('채팅방 생성 실패:', error);
        }
      }
    },
    [chatMessageList, profileInfo.id]
  );

  // 채팅방의 메시지 내역과 정보를 함께 가져오기
  const handleUserClick = useCallback(
    async (chatRoomId) => {
      try {
        const response = await ChatRoomService.chatRoomMessagesWithInfo(
          chatRoomId
          );
          setMessages(response.messages.reverse());
          
          const isSender = response.senderId === profileInfo.id;
          const selectedUser = isSender
          ? allUserProfiles.find((user) => user.id === response.receiverId)
          : allUserProfiles.find((user) => user.id === response.senderId);
          
          setSelectedUser(selectedUser);
          setChatRoomId(chatRoomId);
      } catch (error) {
        console.error('메시지와 채팅방 정보를 가져오는 중 오류 발생:', error);
      }
    },
    [profileInfo.id, allUserProfiles]
  );

  return (
    <ChatRoomContext.Provider
      value={{
        chatRoomId,
        selectedUser,
        setSelectedUser,
        chatMessageList,
        setMessages,
        messages,
        setChatMessageList,
        handleSelectedUser,
        handleUserClick,
        fetchChatMessageList,
        receivedMessageCount,
        isLoggedIn,
      }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
};

export { ChatRoomContext };
