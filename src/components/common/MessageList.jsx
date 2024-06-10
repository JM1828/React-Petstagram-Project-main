import React, { useState } from 'react';
import './MessageList.css';
import styled from 'styled-components';
import GetRelativeTime from '../../utils/GetRelativeTime';
import useUser from '../hook/useUser';
import useChatRoom from '../hook/useChatRoom';
import useAllUser from '../hook/useAllUser';
import { useNavigate } from 'react-router-dom';
import { enterRoom } from '../service/ChatWebSocketService.js';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const Content = styled.div`
  background: white;
  padding: 0;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 580px;
  width: 90%;
  max-height: 100vh;
  height: 80%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  position: relative;
  margin-top: 30px;
`;

const Title = styled.h4`
  font-size: 17px;
  text-align: center;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 30px;
`;

const CloseIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  position: absolute;
  right: 10px;
  margin-bottom: 30px;
`;

const Body = styled.div`
  padding: 20px;
  flex-grow: 1;
  margin-top: 15px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  margin-right: 10px;
  white-space: nowrap; /* 텍스트가 줄 바꿈되지 않도록 함 */
`;

const InputField = styled.input`
  flex-grow: 1;
  padding: 10px;
`;

const MessageText = styled.p`
  margin-top: 30px;
  color: grey;
  font-size: 14px;
`;

const SelectButton = styled.button`
  width: calc(100% - 40px);
  padding: 10px;
  background-color: #d3e8ff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 20px auto; /* 가운데 정렬을 위해 auto 사용 */
  font-size: 16px;
  text-align: center;
`;

const MessageList = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const {
    handleSelectedUser,
    chatMessageList,
    handleUserClick,
    selectedUser,
    setSelectedUser,
  } = useChatRoom();
  const { allUserProfiles } = useAllUser();
  const { profileInfo, getProfileImageUrl } = useUser();
  const navigate = useNavigate();

  const userProfilesArray = Array.isArray(allUserProfiles)
    ? allUserProfiles
    : [];

  const handleClose = () => {
    setShowModal(false);
  };

  const handleOpen = () => {
    setShowModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleChatRoomUserClick = (chatRoomId) => {
    enterRoom(chatRoomId);
    handleUserClick(chatRoomId);
    navigate(`/messages/${chatRoomId}`);
  };

  const handleCreateChatRoom = async () => {
    if (selectedUser) {
      const chatRoomId = await handleSelectedUser(selectedUser);
      if (chatRoomId) {
        navigate(`/messages/${chatRoomId}`);
        handleClose();
      }
    } else {
      console.warn('선택된 사용자가 없습니다.');
    }
  };

  const getSearchUsers = () => {
    if (searchText === '') {
      return [];
    }
    return userProfilesArray.filter(
      (user) =>
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.name &&
          user.name.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  const searchResults = getSearchUsers();

  return (
    <div className="messagelist">
      <div className="Message_title_div">
        <h2 className="Message_title_section">메시지</h2>
        <img
          className="Message_message_edit"
          src="../src/assets/message/message_edit.png"
          alt="edit icon"
          onClick={handleOpen}
        />
      </div>

      {chatMessageList.length > 0 ? (
        chatMessageList.map((chatRoom) => {
          const isSender = chatRoom.senderId === profileInfo.id;
          const otherUser = isSender
            ? chatRoom.receiverName
            : chatRoom.senderName;

          const lastMessage =
            chatRoom.messages.length > 0
              ? chatRoom.messages[0].imageList &&
                chatRoom.messages[0].imageList.length > 0
                ? chatRoom.messages[0].senderId === profileInfo.id
                  ? '나: 사진을 보냈습니다.'
                  : '사진을 보냈습니다.'
                : chatRoom.messages[0].senderId === profileInfo.id
                ? `나: ${chatRoom.messages[0].messageContent}`
                : chatRoom.messages[0].messageContent
              : '메시지가 없습니다.';

          const lastMessageTime =
            chatRoom.messages.length > 0
              ? GetRelativeTime(chatRoom.messages[0].regTime)
              : '';

          // 발신자로 로그인했을 때와 수신자로 로그인했을 때 프로필 이미지 다르게 표시
          let profileImageUrl;
          if (isSender) {
            profileImageUrl = getProfileImageUrl(
              allUserProfiles.find((user) => user.id === chatRoom.receiverId)
                ?.profileImage
            );
          } else {
            profileImageUrl = getProfileImageUrl(
              allUserProfiles.find((user) => user.id === chatRoom.senderId)
                ?.profileImage
            );
          }

          return (
            <div
              key={chatRoom.id}
              className="Message_message_item"
              onClick={() => handleChatRoomUserClick(chatRoom.id)}
            >
              <div className="Message_post-ellipse" />
              <img
                className="Message_ellipse"
                src={profileImageUrl}
                alt="Profile"
              />
              <div className="Message_message_info">
                <div className="Message_user_name">{otherUser}</div>
                <div className="Message_message_text">{lastMessage}</div>
                <div className="Message_message_time">{lastMessageTime}</div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="Message_message_text">메시지가 없습니다.</div>
      )}

      {showModal && (
        <Overlay>
          <Content>
            <Header>
              <Title>새로운 메시지</Title>
              <CloseIcon
                src="../src/assets/message/message_close.png"
                alt="Close"
                onClick={handleClose}
              />
            </Header>
            <Body>
              <InputContainer>
                <InputLabel>받는 사람 :</InputLabel>
                <InputField
                  type="text"
                  placeholder="검색..."
                  value={searchText}
                  onChange={handleSearchChange}
                />
              </InputContainer>
              {searchText !== '' && (
                <MessageText>
                  {searchResults.length > 0
                    ? searchResults.map((result, index) => (
                        <div key={index}>
                          <input
                            type="checkbox"
                            checked={selectedUser === result}
                            onChange={() => handleUserSelect(result)}
                          />
                          {result.email}
                        </div>
                      ))
                    : '계정을 찾을 수 없습니다.'}
                </MessageText>
              )}
            </Body>
            <SelectButton onClick={handleCreateChatRoom}>채팅</SelectButton>
          </Content>
        </Overlay>
      )}
      {/* <CreateChatRoom show={showModal} onClose={handleClose} /> */}
    </div>
  );
};

export default MessageList;
