import React, { useState } from 'react';
import './MessageRoom.css';
import UserService from '../service/UserService';

const MessageRoom = () => {
  const [messageContent, setMessageContent] = useState(''); // 메시지 입력 상태 관리

  // 메시지 입력 핸들러
  const handleMessageChange = (event) => {
    setMessageContent(event.target.value);
  };

  // onKeyDown 이벤트 핸들러를 추가, Enter 키로 메시지 전송
  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      await sendMessage();
    }
  };

  // 메시지 전송 핸들러
  const sendMessage = async () => {
    if (messageContent.trim() === '') return; // 메시지가 비어있는 경우 전송하지 않음

    const formData = new FormData();
    formData.append('messageContent', messageContent);

    try {
      const response = await UserService.sendMessage(formData); // 메시지 전송
      console.log('메시지 전송 결과:', response);
      setMessageContent(''); // 메시지 전송 후 입력 필드 초기화
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  return (
    <div className="messageroom">
      <div className="user_container">
        <img className="profile_image1" />
        <div className="user_name_one">User_Name</div>
        <img
          className="profile_detail"
          src="../src/assets/message/material-symbols_info-outline.png"
          alt="Info Icon"
        />
      </div>

      <div className="user_info">
        <img className="profile_image2" />
        <div className="user_name_two">User_Name</div>
        <div className="user_status">user_name • petstagram</div>
        <button className="profile_btn">프로필 보기</button>
      </div>

      <div className="text_section">
        <div className="text">text</div>
      </div>

      <div className="input_section">
        <img
          className="smile_icon"
          src="../src/assets/message/smile.png"
          alt="smile icon"
        />
        <input
          type="text"
          className="input_message"
          placeholder="메시지 입력 .."
          value={messageContent}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
        />
        <img
          className="mic_icon"
          src="../src/assets/message/bi_mic.png"
          alt="mic icon"
        />
        <img
          className="image_icon"
          src="../src/assets/message/mynaui_image.png"
          alt="image icon"
        />
      </div>
    </div>
  );
};

export default MessageRoom;
