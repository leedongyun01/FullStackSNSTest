const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL 연결 성공!');

    // Users 테이블
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        userId VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    // Posts 테이블
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
        postId VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        caption TEXT,
        imageUrl VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
      )
    `);

    // Likes 테이블 (게시물당 좋아요 저장)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS likes (
        postId VARCHAR(255),
        userId VARCHAR(255),
        PRIMARY KEY (postId, userId),
        FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
      )
    `);

    // Comments 테이블
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        commentId VARCHAR(255) PRIMARY KEY,
        postId VARCHAR(255),
        userId VARCHAR(255),
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('데이터베이스 테이블 초기화 완료');
  } catch (err) {
    console.error('DB 초기화 에러:', err);
    process.exit(1);
  }
};

module.exports = { pool, initDb };
