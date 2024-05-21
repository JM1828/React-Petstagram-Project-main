import React, {useState} from "react";
import "./MessageList.css";
import ChatRoomService from '../service/ChatRoomService';

const MessageList = () => {
    const [chatRoomName, setChatRoomName] = useState("");
    const messages = [
        { id: 1, user: "User_Name", text: "text · 00분", image: "" },
    ];

    const handleCreateChatRoom = async () => {
        const chatRoomDTO = {
            roomName: chatRoomName
        };
        try {
            const response = await ChatRoomService.createChatRoom(chatRoomDTO);
            console.log("채팅방 생성 성공:", response.data);
        } catch (error) {
            console.error("채팅방 생성 실패:", error);
        }
    };

    const handleJoinChatRoom = async (roomId) => {
        try {
            const response = await ChatRoomService.joinChatRoom(roomId);
            console.log("채팅방 참여 성공:", response.data);
        } catch (error) {
            console.error("채팅방 참여 실패:", error);
        }
    };

    return (
        <div className="messagelist">
            <div className="title_div">
                <h2 className="title_section">메시지</h2>
                <img className="message_edit" src="../src/assets/message/message_edit.png"
                 alt="edit icon" 
                 onClick={handleCreateChatRoom}
                 />
            </div>

            {/* 구준모가 작성한 채팅방 이름 적는곳(삭제해도 됨) */}
            <div className="create_chatroom">
                <input
                    type="text"
                    value={chatRoomName}
                    onChange={(e) => setChatRoomName(e.target.value)}
                    placeholder="채팅방 이름 입력"
                />
                <button onClick={handleCreateChatRoom}>채팅방 생성</button>
            </div>
            {/* 여기까지 */}

            {messages.map((message) => (
                <div key={message.id} className="message_item">
                    <div className="post-ellipse" />
                    <img className="ellipse" />
                    <div className="message_info">
                        <div className="user_name">{message.user}</div>
                        <div className="message_text">{message.text}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageList;
