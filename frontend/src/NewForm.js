import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./styles/newform.css";
import "./styles/button.css";

const NewForm = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("이미지를 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.userId);
    formData.append("image", image);
    formData.append("caption", caption);
    formData.append("title", title);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/post`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("업로드 실패");
      }

      alert("게시물이 업로드되었습니다!");
      navigate("/");
    } catch (error) {
      alert("오류: " + error.message);
    }
  };
  return (
    <div className="newform-wrapper">
      <div className="newform-content">
        <h1>이미지 게시물 업로드</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>제목</label>
            <input type="text" onChange={(e) => setTitle(e.target.value)} />
            <label>이미지 선택:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          {previewUrl && (
            <div className="preview-block">
              <p>미리보기:</p>
              <img src={previewUrl} alt="미리보기" />
            </div>
          )}
          <div>
            <label>설명:</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="이미지에 대한 설명을 입력하세요"
            />
          </div>
          <button type="submit" className="btn btn-large">
            업로드
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewForm;
