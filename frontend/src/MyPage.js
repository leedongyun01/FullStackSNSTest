import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./styles/list.css";
import "./styles/button.css";

const MyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/post/all`);
        if (!response.ok) throw new Error("게시물을 불러오는데 실패했습니다.");
        const allPosts = await response.json();
        const filtered = allPosts.filter((p) => p.userId === user.userId);
        setMyPosts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [user]);

  if (!user) return <div className="container"><p>로그인이 필요합니다.</p></div>;

  return (
    <div className="container">
      <header className="main-header">
        <h1>마이페이지</h1>
        <button onClick={() => navigate("/")} className="btn btn-small btn-outline">
          홈으로
        </button>
      </header>

      <section className="hero-section" style={{padding: '30px', textAlign: 'left', marginBottom: '40px'}}>
        <h2 style={{fontSize: '24px'}}>반가워요, {user.name}님! 😊</h2>
        <div style={{color: 'var(--text-muted)'}}>
          <p><strong>이메일:</strong> {user.email}</p>
        </div>
      </section>
      
      <div className="list">
        <div className="list-header">
          <h3>내 게시물 ({myPosts.length})</h3>
        </div>
        
        {loading ? (
          <p>로딩 중...</p>
        ) : myPosts.length > 0 ? (
          <div className="posts-grid">
            {myPosts.map((post) => (
              <Link to={`/post/${post.postId}`} state={{ post }} key={post.postId} className="post-card">
                <img 
                  className="post-card-image" 
                  src={`${process.env.REACT_APP_API_URL}/post?file=${encodeURIComponent(post.imageUrl)}`} 
                  alt={post.title} 
                />
                <div className="post-card-content">
                  <h3 className="post-card-title">{post.title}</h3>
                  <div className="post-card-meta">
                    <span>❤️ {post.likes?.length || 0}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--border-radius)'}}>
            <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>아직 작성한 게시물이 없습니다.</p>
            <Link to="/new" className="btn btn-primary">첫 게시물 작성하기</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
