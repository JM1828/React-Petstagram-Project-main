import React,{useState} from "react";
import MessageList from "../common/MessageList";
import MessageRoom from "../common/MessageRoom";
import ChatRoomService from '../service/ChatRoomService';

const Message = ({allUserProfiles}) => {
    const [chatRoom, setChatRoom] = useState(null); // 채팅방 ID를 저장할 상태
    const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 저장할 상태

    // 선택된 사용자 정보 처리하는 함수
  const handleSelectedUser = async (selectedUser) => {
    console.log('선택된 사용자:', selectedUser);
    setSelectedUser(selectedUser); // 선택된 사용자 저장

    // 선택된 사용자 정보를 이용하여 채팅방 생성 로직 구현
    const chatRoomDTO = {
      userEmails: [selectedUser.email],
    };

    try {
      const response = await ChatRoomService.createChatRoom(chatRoomDTO);
      console.log('채팅방 생성 성공:', response);
      setChatRoom(response.id); // 채팅방 ID 저장
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

    return (
        <div>
            <MessageList 
            allUserProfiles={allUserProfiles} 
            handleSelectedUser={handleSelectedUser}
             />
            <MessageRoom chatRoom={chatRoom} 
            selectedUser={selectedUser}
            />
        </div>
    );
};

export default Message;
