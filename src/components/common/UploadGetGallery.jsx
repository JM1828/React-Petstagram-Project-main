import './UploadModal.css';
import React, { useRef, useEffect, useState } from 'react';
import PostService from '../service/PostService';

import useModal from '../hook/useModal';
import useUser from '../hook/useUser';
import usePost from '../hook/usePost';

import Loading from '../ui/Loading';
import DeleteConfirm from '../ui/DeleteConfirm';
import EmojiPicker from '../ui/EmojiPicker';

import * as mobilenet from '@tensorflow-models/mobilenet';
import KakaoMapModal from '../ui/kakaomap/KakaoMapModal';

const UploadGetGallery = ({ onClose }) => {
  const { isLoggedIn, profileInfo } = useUser();
  const { postList, setPostList, setPostSuccess } = usePost(
    isLoggedIn,
    profileInfo
  );
  const { openModal, closeModal, isModalOpen } = useModal();
  const fileInputRef = useRef(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [text, setText] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const maxTextLength = 2200;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ src: reader.result, file });
        };
        reader.onerror = reject;
        if (file.type.startsWith('image')) {
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video')) {
          reader.readAsDataURL(file);
        }
      });
    });

    Promise.all(promises)
      .then((media) => {
        const isImage = media.every((m) => m.file.type.startsWith('image'));
        const isVideo = media.every((m) => m.file.type.startsWith('video'));
        if (isImage) {
          setSelectedMedia(media);
          setMediaType('image');
        } else if (isVideo) {
          setSelectedMedia(media);
          setMediaType('video');
        } else {
          console.error('이미지와 비디오를 혼합해서 업로드할 수 없습니다.');
        }
      })
      .catch((error) => {
        console.error('파일을 읽는 중 오류가 발생했습니다:', error);
      });
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

  const handleSubmit = async () => {
    try {
      openModal('loading');
      const postData = { postContent: text, location: selectedAddress };
      const formData = new FormData();
      formData.append(
        'post',
        new Blob([JSON.stringify(postData)], {
          type: 'application/json',
        })
      );

      if (selectedMedia && selectedMedia.length > 0) {
        if (mediaType === 'image') {
          for (let media of selectedMedia) {
            const breed = await PostService.classifyImage(media.file);
            console.log('Predictions: ', breed);

            formData.append('breed', breed);
            formData.append('file', media.file);
          }
        } else if (mediaType === 'video') {
          formData.append('file', selectedMedia[0].file);
        }
      } else {
        console.error('파일이 선택되지 않았습니다.');
        closeModal('loading');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await PostService.createPost(formData, token);
      setPostList([...postList, response.data]);
      setPostSuccess(true);
      onClose();
    } catch (error) {
      console.error('게시글 업로드 중 오류 발생:', error);
      setPostList(postList);
    } finally {
      closeModal('loading');
    }
  };

  return (
    <div className="post-frame-container">
      {isModalOpen('loading') && <Loading />}
      <button
        className="post-close-modal"
        onClick={() => openModal('deleteConfirm')}
      >
        ✕
      </button>
      <div className="post-frame">
        <div className="post-header">
          <div className="post-text-wrapper">새 게시물 만들기</div>
          <div className="post-text-wrapper-2" onClick={handleSubmit}>
            공유하기
          </div>
        </div>
        <div className="post-content">
          <div className="post-image-section">
            {selectedMedia ? (
              <div className="post-img-section">
                {mediaType === 'image' ? (
                  selectedMedia.map((media, index) => (
                    <img
                      key={index}
                      src={media.src}
                      alt={`Selected ${index}`}
                      className="post-selected-image"
                    />
                  ))
                ) : (
                  <video
                    controls
                    src={selectedMedia[0].src}
                    className="post-selected-video"
                  />
                )}
              </div>
            ) : (
              <div className="post-media-pull">
                <img
                  className="image_file"
                  src="../src/assets/postmodal/photo.png"
                  alt="포스트 모달 이미지"
                />
                <br />
                사진과 동영상을 끌어다 놓으세요
              </div>
            )}
            <div
              className="post-file-div"
              style={{
                display: selectedMedia ? 'none' : 'block',
              }}
            >
              <div
                className="file_section"
                onClick={() => fileInputRef.current.click()}
              >
                컴퓨터에서 선택
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
              />
            </div>
          </div>
          <div className="post-details-section">
            <div className="post-user-info">
              <img
                className="post-ellipse"
                src={profileInfo.profileImageUrl}
                alt="User Profile"
              />
              <div className="post-text-wrapper-3">{profileInfo.email}</div>
            </div>
            <div className="post-textarea-section">
              <textarea
                className="post-input-wrapper"
                placeholder="문구를 입력하세요..."
                value={text}
                onChange={handleTextChange}
              />
              <div className="post-counter">
                <img
                  className="post-uil-smile"
                  alt="Uil smile"
                  src="../src/assets/postmodal/smile.png"
                  onClick={() => openModal('emojiPicker')}
                />
                <div className="post-text-wrapper-5">
                  {text.length}/{maxTextLength}
                </div>
              </div>
              {isModalOpen('emojiPicker') && (
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              )}
            </div>
            <PostOptions
              openModal={openModal}
              selectedAddress={selectedAddress}
            />
          </div>
        </div>
      </div>
      {isModalOpen('deleteConfirm') && (
        <DeleteConfirm closeModal={closeModal} onClose={onClose} />
      )}
      {isModalOpen('kakaoMap') && (
        <KakaoMapModal
          onClose={() => closeModal('kakaoMap')}
          setSelectedAddress={setSelectedAddress} // 주소 설정 함수 전달
        />
      )}
    </div>
  );
};

const PostOptions = ({ openModal, selectedAddress }) => (
  <div className="post-options">
    {[
      {
        label: '위치 ',
        icon: '../src/assets/postmodal/location.png',
        onClick: () => openModal('kakaoMap'),
        showAddress: true, // 주소를 표시할 항목에 플래그 추가
      },
      {
        label: '접근성',
        icon: '../src/assets/postmodal/under.png',
        showAddress: false,
      },
      {
        label: '고급 설정',
        icon: '../src/assets/postmodal/under.png',
        showAddress: false,
      },
    ].map((option, index) => (
      <div className="post-option" key={index} onClick={option.onClick}>
        <div className="post-text-wrapper-6">
          {option.label}
          {option.showAddress && (
            <span className="post-address"> {selectedAddress}</span>
          )}
        </div>
        <img className="post-icon" alt="Frame" src={option.icon} />
      </div>
    ))}
  </div>
);

export default UploadGetGallery;
