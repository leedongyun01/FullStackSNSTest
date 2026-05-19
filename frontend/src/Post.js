import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Comments from "./Comment";
import { useAuth } from "./context/AuthContext";
import "./styles/post.css";
import "./styles/button.css";

const Post = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { post } = location.state || {};

  const [postUser, setPostUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState(null);
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(user && post?.likes?.includes(user.userId));

  useEffect(() => {
    if (!post) return;

    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/users/id/${post.userId}`
        );
        if (!response.ok) {
          throw new Error("회원 정보를 불러오는데 실패했습니다.");
        }
        const userData = await response.json();
        setPostUser(userData);
      } catch (error) {
        setErrorUser(error.message);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [post]);

  if (!post) {
    return <div className="container"><p>게시물 데이터를 찾을 수 없습니다.</p></div>;
  }

  const imageUrl = `${process.env.REACT_APP_API_URL}/post?file=${encodeURIComponent(
    post.imageUrl
  )}`;

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/post/${post.postId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("게시글 삭제에 실패했습니다.");
      }

      alert("게시글이 삭제되었습니다.");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/post/${post.postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId }),
      });

      if (!response.ok) throw new Error("좋아요 처리에 실패했습니다.");
      const result = await response.json();
      setLikesCount(result.likesCount);
      setIsLiked(result.isLiked);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="btn btn-small btn-outline" style={{marginBottom: '20px'}}>
        ← 뒤로가기
      </button>
      
      <article className="post-view">
        <img src={imageUrl} alt={post.title} className="post-view-image" />
        
        <div className="post-view-content">
          <header className="post-view-header">
            <h2 className="post-view-title">{post.title}</h2>
            {user && postUser && user.userId === postUser.userId && (
              <button className="btn btn-small btn-danger" onClick={handleDeletePost}>
                삭제
              </button>
            )}
          </header>

          <p className="post-view-caption">{post.caption}</p>

          <div className="like-section">
            <button
              className={`btn btn-like ${isLiked ? 'active' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? '❤️' : '🤍'} 좋아요 {likesCount}
            </button>
          </div>

          <div className="author-box">
            <h3>작성자</h3>
            {loadingUser ? (
              <p>불러오는 중...</p>
            ) : errorUser ? (
              <p>{errorUser}</p>
            ) : postUser ? (
              <div className="author-info">
                <p><strong>{postUser.name}</strong></p>
                <p style={{color: 'var(--text-muted)', fontSize: '14px'}}>{postUser.email}</p>
              </div>
            ) : (
              <p>정보 없음</p>
            )}
          </div>

          <hr />
          <Comments postId={post.postId} />
        </div>
      </article>
    </div>
  );
};

export default Post;
