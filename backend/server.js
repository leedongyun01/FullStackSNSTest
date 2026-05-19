const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { pool, initDb } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 이미지 업로드 설정 (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

// --- API 엔드포인트 ---

// 1. 회원가입
app.post('/api/users/signup', async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }
    const userId = uuidv4();
    await pool.query('INSERT INTO users (userId, email, name, password) VALUES (?, ?, ?, ?)', [userId, email, name, password]);
    res.status(201).json({ userId, email, name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. 로그인
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (users.length === 0) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
    }
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. 사용자 정보 조회
app.get('/api/users/id/:userId', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT userId, email, name FROM users WHERE userId = ?', [req.params.userId]);
    if (users.length === 0) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. 게시물 업로드
app.post('/api/post', upload.single('image'), async (req, res) => {
  const { userId, title, caption } = req.body;
  const postId = uuidv4();
  const imageUrl = req.file ? req.file.filename : null;
  try {
    await pool.query('INSERT INTO posts (postId, userId, title, caption, imageUrl) VALUES (?, ?, ?, ?, ?)', 
      [postId, userId, title, caption, imageUrl]);
    res.status(201).json({ postId, userId, title, caption, imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. 모든 게시물 조회
app.get('/api/post/all', async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT p.*, (SELECT JSON_ARRAYAGG(userId) FROM likes WHERE postId = p.postId) as likes 
      FROM posts p ORDER BY createdAt DESC
    `);
    // MySQL의 JSON_ARRAYAGG 결과를 가공
    const formattedPosts = posts.map(p => ({
      ...p,
      likes: p.likes || []
    }));
    res.json(formattedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. 이미지 파일 스트리밍
app.get('/api/post', (req, res) => {
  const fileName = req.query.file;
  if (!fileName) return res.status(400).send('File query missing');
  res.sendFile(path.join(__dirname, 'uploads', fileName));
});

// 7. 게시물 삭제
app.delete('/api/post/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const [rows] = await pool.query('SELECT imageUrl FROM posts WHERE postId = ?', [postId]);
    if (rows.length > 0 && rows[0].imageUrl) {
      const imagePath = path.join(__dirname, 'uploads', rows[0].imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await pool.query('DELETE FROM posts WHERE postId = ?', [postId]);
    res.json({ message: "삭제 성공" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. 댓글 조회
app.get('/api/comment/:postId', async (req, res) => {
  try {
    const [comments] = await pool.query('SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC', [req.params.postId]);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. 댓글 작성
app.post('/api/comment', async (req, res) => {
  const { postId, userId, content } = req.body;
  const commentId = uuidv4();
  try {
    await pool.query('INSERT INTO comments (commentId, postId, userId, content) VALUES (?, ?, ?, ?)', 
      [commentId, postId, userId, content]);
    res.status(201).json({ commentId, postId, userId, content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 10. 댓글 삭제
app.delete('/api/comment/:commentId', async (req, res) => {
  try {
    await pool.query('DELETE FROM comments WHERE commentId = ?', [req.params.commentId]);
    res.json({ message: "댓글 삭제 성공" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 11. 댓글 수정 (PATCH)
app.patch('/api/comment/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  try {
    await pool.query('UPDATE comments SET content = ? WHERE commentId = ?', [content, commentId]);
    const [updated] = await pool.query('SELECT * FROM comments WHERE commentId = ?', [commentId]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 12. 좋아요 처리
app.post('/api/post/:postId/like', async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM likes WHERE postId = ? AND userId = ?', [postId, userId]);
    let isLiked;
    if (existing.length === 0) {
      await pool.query('INSERT INTO likes (postId, userId) VALUES (?, ?)', [postId, userId]);
      isLiked = true;
    } else {
      await pool.query('DELETE FROM likes WHERE postId = ? AND userId = ?', [postId, userId]);
      isLiked = false;
    }
    const [count] = await pool.query('SELECT COUNT(*) as count FROM likes WHERE postId = ?', [postId]);
    res.json({ likesCount: count[0].count, isLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 서버 시작 전 DB 초기화
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
