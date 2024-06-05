import React, { useState, useRef } from 'react';
import './MessageRoom.css';
import { sendMessageWithImage } from '../service/ChatWebSocketService.js';
import styled from 'styled-components';
import ChatRoomService from '../service/ChatRoomService';
import { Link } from 'react-router-dom';

// 이모지 선택창 스타일
const EmojiPickerModal = styled.div`
  position: relative;
  top: 30px;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
  width: 250px;
`;

const EmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin: 5px;
  display: inline-block;
`;

const EmojiTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const EmojiList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const EmojiPicker = ({ onEmojiClick }) => (
  <EmojiPickerModal>
    <EmojiTitle>최고 인기 이모티콘</EmojiTitle>
    <EmojiList>
      {['🐥', '🐣', '🐤', '🐧', '🐦', '🐰', '🐹'].map((emoji) => (
        <EmojiButton key={emoji} onClick={() => onEmojiClick(emoji)}>
          {emoji}
        </EmojiButton>
      ))}
    </EmojiList>
  </EmojiPickerModal>
);

const MessageRoom = ({ selectedUser, chatRoomId, profileInfo, messages }) => {
  const [messageContent, setMessageContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const getImageUrl = (image) => {
    return `http://localhost:8088/uploads/${image.imageUrl}`;
  };

  // 메시지 입력 핸들러
  const handleMessageChange = (event) => {
    setMessageContent(event.target.value);
  };

  // 메시지와 이미지 함께 보내기
  const handleSendMessage = async () => {
    if (!messageContent && !fileInputRef.current?.files[0] && !selectedImage) {
      // 메시지나 이미지가 없으면 아무것도 하지 않음
      return;
    }

    let imageUrl = '';

    // 이미지가 선택되었거나 파일이 업로드 되었다면, 이미지 업로드 처리
    if (fileInputRef.current?.files[0] || selectedImage) {
      let imageToUpload = fileInputRef.current?.files[0];
      if (!imageToUpload) {
        // fileInputRef에서 파일을 찾을 수 없으면 selectedImage에서 Blob 생성
        const blob = await fetch(selectedImage).then((res) => res.blob());
        imageToUpload = blob;
      }
      imageUrl = await ChatRoomService.uploadImage(imageToUpload);
    }

    // 메시지, 이미지 또는 둘 다 있는 경우 메시지 전송 처리
    await sendMessageWithImage(
      chatRoomId,
      profileInfo.id,
      selectedUser.id,
      messageContent,
      imageUrl
    );

    // 상태 초기화
    setMessageContent('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 엔터키로 메시지 보내기
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 이모티콘과 같이 메시지 보내기
  const handleEmojiClick = (emoji) => {
    setMessageContent(messageContent + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="messageroom">
      <div className="user_container">
        <img className="profile_image1" src={selectedUser?.profileImageUrl} />
        <div className="user_name_one">{selectedUser?.name}</div>
        <img
          className="profile_detail"
          src="../src/assets/message/material-symbols_info-outline.png"
          alt="Info Icon"
        />
      </div>

      <div className="user_info">
        <img className="profile_image2" src={selectedUser?.profileImageUrl} />
        <div className="user_name_two">{selectedUser?.name}</div>
        <div className="user_status">{selectedUser?.email} • petstagram</div>
        <button className="profile_btn">
          <Link to={`/profile/${selectedUser?.id}`}>프로필 보기</Link>
        </button>
      </div>

      <div className="text_section">
        {messages
          .filter((message) => message.chatRoomId === chatRoomId)
          .map((message, index) => (
            <div className="text" key={index}>
              {message.imageList &&
                message.imageList.map((image, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(image)}
                    alt={`Message ${idx + 1}`}
                  />
                ))}
              {message.messageContent}
            </div>
          ))}
        {selectedImage && (
          <img
            className="selected-image-preview"
            src={selectedImage}
            alt="Selected Image Preview"
          />
        )}
      </div>
      <div className="input_section">
        <img
          className="smile_icon"
          src="../src/assets/message/smile.png"
          alt="smile icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
        {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
        <input
          className="input_message"
          placeholder="메시지 입력 .."
          value={messageContent}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
        />
        <input
          type="file"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button onClick={handleSendMessage}>전송</button>
        <img
          className="mic_icon"
          src="../src/assets/message/bi_mic.png"
          alt="mic icon"
        />
        <img
          className="image_icon"
          src="../src/assets/message/mynaui_image.png"
          alt="image icon"
          onClick={() => fileInputRef.current.click()}
        />
      </div>
    </div>
  );
};

export default MessageRoom;
