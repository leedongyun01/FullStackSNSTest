import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./Main";
import NewForm from "./NewForm";
import Post from "./Post";
import Login from "./Login";
import Signup from "./Signup";
import MyPage from "./MyPage";

const Router = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/new" element={<NewForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
