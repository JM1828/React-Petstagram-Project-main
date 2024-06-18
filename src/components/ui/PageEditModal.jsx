import React, { useRef, useEffect, useState } from 'react';
import './PageEditModal.css';
import usePost from '../hook/usePost';
import useModal from '../hook/useModal';

import EmojiPicker from './EmojiPicker';
import Loading from './Loading';
import icons from '../../assets/ImageList';

const PageEditModal = ({ onClose, post, allUserProfiles, setCurrentPost }) => {
  const { updatePost } = usePost();
  const { openModal, closeModal, isModalOpen, toggleModal } = useModal();

  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [text, setText] = useState('');
  const maxTextLength = 2200;

  const getUserProfileImage = (email) => {
    const user = allUserProfiles.find((user) => user.email === email);
    return user ? user.profileImageUrl : '';
  };

  useEffect(() => {
    if (post) {
      const imageUrls = post.imageList.map(
        (image) => `http://localhost:8088/uploads/${image.imageUrl}`
      );
      setSelectedImages(imageUrls);

      const videoUrl =
        post.videoList && post.videoList.length > 0
          ? `http://localhost:8088/uploads/${post.videoList[0].videoUrl}`
          : null;
      setSelectedVideo(videoUrl);

      setText(post.postContent || '');
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [post]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    const newImages = [];
    let newVideo = null;

    for (const file of files) {
      const fileType = file.type;

      if (fileType.startsWith('image/')) {
        if (selectedVideo) {
          alert('이미지를 동영상으로 바꿀 수 없습니다. 이미지를 선택하세요.');
          return;
        }
        newImages.push(URL.createObjectURL(file));
      } else if (fileType.startsWith('video/')) {
        if (selectedImages.length > 0) {
          alert('동영상을 이미지로 바꿀 수 없습니다. 동영상을 선택하세요.');
          return;
        }
        newVideo = URL.createObjectURL(file);
      }
    }

    if (newImages.length > 0) {
      setSelectedImages((prevImages) => [...prevImages, ...newImages]);
      setSelectedVideo(null);
    }
    if (newVideo) {
      setSelectedVideo(newVideo);
      setSelectedImages([]);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= maxTextLength) {
      setText(newText);
    }
  };

  const handleEmojiClick = (emoji) => {
    setText(text + emoji);
    closeModal('emojiPicker');
  };

  const handleUpdateSubmit = async () => {
    try {
      openModal('loading');
      const currentFile = fileInputRef.current?.files[0] || null;
      const currentText = text;

      const updatedPost = await updatePost(post, currentFile, currentText);

      setCurrentPost(updatedPost);
      onClose();
    } catch (error) {
      console.error(
        '게시글 수정 중 오류 발생:',
        error.response ? error.response.data : error.message
      );
    } finally {
      closeModal('loading');
    }
  };

  return (
    <div className="pageedit-frame-container">
      {isModalOpen('loading') && <Loading />}
      <div className="pageedit-frame">
        <div className="pageedit-header">
          <div className="pageedit-text-cancle" onClick={onClose}>
            취소
          </div>
          <div className="pageedit-text-wrapper">정보 수정</div>
          <div className="pageedit-text-wrapper-2" onClick={handleUpdateSubmit}>
            완료
          </div>
        </div>
        <div className="pageedit-content">
          <div
            className="pageedit-image-section"
            onClick={() => fileInputRef.current.click()}
          >
            {selectedImages && (
              <div className="pageedit-img-section">
                {selectedImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Selected"
                    className="pageedit_selected-image"
                  />
                ))}
              </div>
            )}

            {selectedVideo && (
              <div className="pageedit-img-section">
                <video
                  className="pageedit_selected-image"
                  src={selectedVideo}
                  controls
                />
              </div>
            )}

            <div
              className="pageedit-file-div"
              style={{
                display: selectedImages || selectedVideo ? 'none' : 'block',
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
              />
            </div>
          </div>
          <div className="pageedit-details-section">
            <div className="pageedit-user-info">
              {post.imageList && post.imageList[0] && (
                <img
                  className="pageedit-ellipse"
                  src={getUserProfileImage(post.email)}
                />
              )}
              <div className="pageedit-text-wrapper-3">{post.email}</div>
            </div>
            <div className="pageedit-textarea-section">
              <textarea
                className="pageedit-input-wrapper"
                placeholder="문구를 입력하세요..."
                value={text}
                onChange={handleTextChange}
              />
              <div className="pageedit-counter">
                <img
                  className="pageedit-uil-smile"
                  alt="Uil smile"
                  src={icons.smileIcon}
                  onClick={() => toggleModal('emojiPicker')}
                />
                <div className="pageedit-text-wrapper-5">
                  {text.length}/{maxTextLength}
                </div>
              </div>
              {isModalOpen('emojiPicker') && (
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              )}
            </div>
            <div className="pageedit-options">
              <div className="pageedit-option">
                <div className="pageedit-text-wrapper-6">위치 추가</div>
                <img
                  className="pageedit-icon"
                  alt="Frame"
                  src={icons.locationIcon}
                />
              </div>
              <div className="pageedit-option">
                <div className="pageedit-text-wrapper-6">접근성</div>
                <img
                  className="pageedit-icon"
                  alt="Frame"
                  src={icons.underArrowIcon}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditModal;
