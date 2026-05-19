import { Link } from "react-router-dom";
import List from "./List";
import { useAuth } from "./context/AuthContext";
import "./styles/global.css";
import "./styles/main.css";
import "./styles/button.css";

const Main = () => {
  const { user, logout } = useAuth();
  return (
    <div className="container">
      <header className="main-header">
        <h1>ImgCommunity</h1>
        {user && (
          <div className="header-buttons">
            <Link to="/mypage" className="btn btn-small btn-outline">마이페이지</Link>
            <button className="btn btn-small btn-danger" onClick={logout}>
              로그아웃
            </button>
          </div>
        )}
      </header>
      
      {!user ? (
        <section className="hero-section">
          <h2>환영합니다! 👋</h2>
          <p>이미지로 소통하는 우리들만의 커뮤니티</p>
          <div className="buttons">
            <Link to="/login" className="btn btn-large btn-primary">
              로그인
            </Link>
            <Link to="/signup" className="btn btn-large btn-outline">
              회원가입
            </Link>
          </div>
        </section>
      ) : (
        <List />
      )}
    </div>
  );
};

export default Main;
