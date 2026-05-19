import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./styles/list.css";
import "./styles/button.css";

const POSTS_PER_PAGE = 9;

const List = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/post/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("게시물 불러오기 실패");
        }

        const result = await response.json();
        setPosts(result);
      } catch (error) {
        console.error("에러 발생:", error);
      }
    };

    fetchPosts();
  }, []);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="list">
      <div className="list-header">
        <h1>최신 게시물</h1>
        <Link to="/new" className="btn btn-small btn-primary">
          + 새로운 게시물
        </Link>
      </div>

      <div className="posts-grid">
        {currentPosts.map((post) => (
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

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
            <button
              key={num}
              className={`btn btn-small ${num === currentPage ? "active" : "btn-outline"}`}
              onClick={() => handlePageChange(num)}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default List;
