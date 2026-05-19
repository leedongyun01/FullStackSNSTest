import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./styles/login.css";
import "./styles/button.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("로그인 실패");
      }

      const result = await response.json();

      login(result);
      alert("로그인 성공!");
      navigate("/");
    } catch (error) {
      alert("로그인 실패: " + error.message);
    }
  };

  return (
    <div className="container" style={{maxWidth: '400px', marginTop: '100px'}}>
      <div className="form" style={{background: 'white', padding: '40px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)'}}>
        <form onSubmit={handleLogin}>
          <h2 style={{textAlign: 'center', marginBottom: '30px'}}>로그인</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <input
              style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-large btn-primary" style={{marginTop: '10px'}}>
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
