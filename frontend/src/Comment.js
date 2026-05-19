import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import "./styles/comment.css";
import "./styles/button.css";

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/comment/${postId}`
        );
        if (!response.ok) {
          throw new Error("댓글을 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setComments(data);
      } catch (err) {}
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postId,
          userId: user.userId,
          content: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error("댓글 작성에 실패했습니다.");
      }

      const fetchResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/comment/${postId}`
      );
      if (!fetchResponse.ok) {
        throw new Error("댓글 목록을 불러오는데 실패했습니다.");
      }
      const updatedComments = await fetchResponse.json();
      setComments(updatedComments);
      setNewComment("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/comment/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }
      setComments((prev) =>
        prev.filter((comment) => comment.commentId !== commentId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditing = (commentId, currentContent) => {
    setEditingId(commentId);
    setEditingText(currentContent);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const submitEdit = async (commentId) => {
    if (!editingText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/comment/${commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editingText }),
        }
      );

      if (!response.ok) {
        throw new Error("댓글 수정에 실패했습니다.");
      }

      const updatedComment = await response.json();

      setComments((prev) =>
        prev.map((comment) =>
          comment.commentId === commentId ? updatedComment : comment
        )
      );
      cancelEditing();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="comments-wrapper">
      <h3>댓글 ({comments.length})</h3>
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.commentId} className="comment-item">
            {editingId === comment.commentId ? (
              <>
                <textarea
                  className="edit-textarea"
                  rows={3}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <div className="comment-btn-group">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => submitEdit(comment.commentId)}
                  >
                    저장
                  </button>
                  <button className="btn btn-small btn-outline" onClick={cancelEditing}>
                    취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="comment-content">{comment.content}</p>
                {user && user.userId === comment.userId && (
                  <div className="comment-btn-group">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() =>
                        startEditing(comment.commentId, comment.content)
                      }
                    >
                      수정
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(comment.commentId)}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="따뜻한 댓글을 남겨주세요"
            rows={3}
          />
          <button type="submit" className="btn btn-large btn-primary">
            댓글 작성
          </button>
        </form>
      ) : (
        <p style={{textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)'}}>
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}
    </div>
  );
};

export default Comments;
