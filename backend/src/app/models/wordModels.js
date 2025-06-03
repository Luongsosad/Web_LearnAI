import pool from '../config/database.js';

// Lấy tất cả categories
async function getAllCategories() {
  const query = `SELECT * FROM categories ORDER BY id`;
  const res = await pool.query(query);
  return res.rows;
}

// Tạo category mới
async function createCategory(name) {
  const query = `INSERT INTO categories (name) VALUES ($1) RETURNING *`;
  const res = await pool.query(query, [name]);
  return res.rows[0];
}

// Lấy tất cả topics theo category_id
async function getTopicsByCategoryId(categoryId) {
  const query = `SELECT * FROM topics WHERE category_id = $1 ORDER BY id`;
  const res = await pool.query(query, [categoryId]);
  return res.rows;
}

// Tạo topic mới
async function createTopic(name, categoryId) {
  const query = `
    INSERT INTO topics (name, category_id)
    VALUES ($1, $2) RETURNING *`;
  const res = await pool.query(query, [name, categoryId]);
  return res.rows[0];
}

// Lấy tất cả words theo topic_id
async function getWordsByTopicId(topicId) {
  const query = `SELECT * FROM words WHERE topic_id = $1 ORDER BY id`;
  const res = await pool.query(query, [topicId]);
  return res.rows;
}

// Tạo từ vựng mới
async function createWord({ word, meaning, pronunciation, type, topic_id, level, example }) {
  const query = `
    INSERT INTO words (word, meaning, pronunciation, type, topic_id, level, example)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`;
  const values = [word, meaning, pronunciation, type, topic_id, level, example];
  const res = await pool.query(query, values);
  return res.rows[0];
}

export {
  getAllCategories,
  createCategory,
  getTopicsByCategoryId,
  createTopic,
  getWordsByTopicId,
  createWord
};
