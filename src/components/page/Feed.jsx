import './Feed.css';
import commentIcon from '../../assets/feed/feed-comment.png';
import heartIcon from '../../assets/feed/feed-heart.png';
import shareIcon from '../../assets/feed/feed-share.png';
import bookmarkIcon from '../../assets/feed/feed-save.png';
import mock1 from '../../assets/7bok1.jpeg';
import GetRelativeTime from '../../utils/GetRelativeTime';
import { useState, useEffect } from 'react';
import CommentService from '../service/CommentService';
import PostService from '../service/PostService';

const Feed = ({
  writer,
  postdate,
  postContent,
  images,
  postId,
  postLikesCount,
}) => {
  console.log(postLikesCount);
  const uploadPostTime = GetRelativeTime(postdate);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(postLikesCount);

  const getImageUrl = (image) => {
    return `http://localhost:8088/uploads/${image.imageUrl}`; // 이미지 URL 구성
  };

  // 사용자별로 로컬 스토리지에 좋아요 상태 저장
  const saveLikeData = (postId, liked) => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.setItem(
        `likeData_${postId}_${token}`,
        JSON.stringify({ liked })
      );
    }
  };

  // 사용자별로 로컬 스토리지에서 좋아요 상태 불러오기
  const loadLikeData = (postId) => {
    const token = localStorage.getItem('token');
    if (token) {
      const data = localStorage.getItem(`likeData_${postId}_${token}`);
      if (data) {
        return JSON.parse(data).liked;
      }
    }
    return false; // 기본 값
  };

  // 좋아요 버튼 클릭 처리 함수
  const handleLikeClick = async () => {
    try {
      const newLikesCount = await PostService.togglePostLike(postId);

      // 좋아요 상태 반전
      const newLikedState = !liked;
      // const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;

      setLiked(newLikedState);
      saveLikeData(postId, newLikedState);
    } catch (error) {
      console.error('좋아요 상태 변경 중 오류가 발생했습니다.', error);
    }
  };

  // 댓글 목록을 불로오는 함수
  const fetchComments = async () => {
    try {
      const commentList = await CommentService.getCommentList(postId);
      setComments(commentList);
    } catch (error) {
      console.log('댓글을 불로오는 중 오류가 발생했습니다.', error);
    }
  };

  // 댓글 작성하는 함수
  const submitComment = async (e) => {
    e.preventDefault();
    if (commentText.trim() === '') return; // 빈 댓글 방지

    const commentData = {
      commentContent: commentText,
      id: postId,
    };

    try {
      await CommentService.createPost(commentData, postId);
      setCommentText(''); // 댓글 입력 필드 비우기
      fetchComments(); // 댓글 작성 후 목록 새로고침
    } catch (error) {
      console.log('댓글을 작성하는 중 오류가 발생했습니다.', error);
    }
  };

  // 컴포넌트가 마운트 될 때 댓글 목록을 불러옴
  useEffect(() => {
    const { liked, likesCount } = loadLikeData(postId);
    setLiked(liked);
    setLikesCount(likesCount);
    fetchComments();
  }, [postId]);

  return (
    <div className="feed">
      <div className="feed-frame">
        <div className="feed-info">
          <img className="feed-profile-img" src={mock1} />
          <div className="feed-writer-name">{writer}</div>
          <div className="feed-writer-date">{uploadPostTime}</div>
          <div className="feed-more">
            <button className="more-btn">
              <div className="ellipse" />
              <div className="ellipse" />
              <div className="ellipse" />
            </button>
          </div>
        </div>
        {images && images.length > 0 && (
          <div className="feed-post-photos">
            {images.map((image, index) => (
              <img
                key={index}
                className="feed-post-photo"
                src={getImageUrl(image)}
                alt={`Post ${index + 1}`}
              />
            ))}
          </div>
        )}
        <div className="feed-active">
          <div className="feed-active-btn">
            <img
              className="heart_img"
              alt="좋아요"
              src={heartIcon}
              onClick={handleLikeClick}
            />
            <img className="share_img" alt="공유" src={shareIcon} />
            <img className="comment_img" alt="댓글" src={commentIcon} />
          </div>
          <img className="bookmark-img" alt="저장" src={bookmarkIcon} />
        </div>
        <div className="feed-post-info">
          <div className="feed-heart-count">좋아요 {likesCount}개</div>
          <div>
            {/* 작성자 아이디 추가하기 */}
            <p className="feed-post-content">
              {postContent}
              <span className="feed-post-more"> 더 보기</span>
            </p>
          </div>

          <div className="feed-comment-more">
            <span>댓글 {comments.length}개 모두 보기</span>
          </div>
          <div className="feed-comments">
            {comments.map((comment, index) => (
              <div key={index} className="feed-comment-item">
                <span>{comment.commentNickName}</span>: {comment.commentContent}
              </div>
            ))}
          </div>
          <form className="feed-comment" onSubmit={submitComment}>
            <input
              type="text"
              className="feed-comment-input"
              placeholder="댓글 달기..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="feed-comment-regi">
              게시
            </button>
            {/* <span style={{ fontSize: 18 }}>☺︎</span> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feed;
