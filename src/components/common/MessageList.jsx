import React, { useState, useEffect } from 'react';
import './MessageList.css';

const MessageList = ({ allUserProfiles, handleSelectedUser  }) => {
//   const messages = [
//     { id: 1, user: "User_Name", text: "text · 00분", image: "" },
// ];

  const userProfilesArray = Array.isArray(allUserProfiles)
    ? allUserProfiles
    : [];
  const [searchText, setSearchText] = useState(''); // 검색어를 저장할 상태
  const [recentSearches, setRecentSearches] = useState([]); // 선택된 사용자를 저장할 상태
  const [selectedUser, setSelectedUser] = useState(null); // 현재 선택된 사용자

  useEffect(() => {
    const storedSearches =
      JSON.parse(localStorage.getItem('recentSearches')) || [];
      setRecentSearches(storedSearches);
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
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

  const handleSelectSearch = (user) => {
    const updatedSearches = [
      user,
      ...recentSearches.filter((u) => u.email !== user.email),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    setSelectedUser(user); // 현재 선택된 사용자 설정
  };

  // 검색 기록 전체 지우기
  const handleClearSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // 검색 기록 선택 지우기
  const handleDeleteSearch = (userEmail) => {
    const updatedSearches = recentSearches.filter(
      (user) => user.email !== userEmail
    );
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleCreateChatRoom = () => {
    if (selectedUser) {
      handleSelectedUser(selectedUser);
    } else {
      console.warn('선택된 사용자가 없습니다.');
    }
  };

  const searchResults = getSearchUsers();

  return (
    <div className="messagelist">
      <div className="title_div">
        <h2 className="title_section">메시지</h2>
        <img
          className="message_edit"
          src="../src/assets/message/message_edit.png"
          alt="edit icon"
          onClick={handleCreateChatRoom}
        />
      </div>

      {/* 구준모가 작성한 채팅방 이름 적는곳(삭제해도 됨) */}
        <div className="search-nav-title">
          <h2>검색</h2>
          <input
            type="text"
            placeholder="검색"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
        <div className={`search-members ${searchText ? '' : 'hidden'}`}>
          {searchResults.map((user) => (
            <div
              key={user.email}
              className="search-item"
              onClick={() => handleSelectSearch(user)}
            >
              <div className="search-info">
                <div className="search-icon-wrapper">
                  <img
                    src={user.profileImageUrl}
                    alt="profile_image"
                    className="search-profile-image"
                  />
                </div>
                <div>{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      {/* 여기까지 */}

      {/* {messages.map((message) => (
        <div key={message.id} className="message_item">
          <div className="post-ellipse" />
          <img className="ellipse" />
          <div className="message_info">
            <div className="user_name">{message.user}</div>
            <div className="message_text">{message.text}</div>
          </div>
        </div>
      ))} */}
    </div>
  );
};

export default MessageList;
