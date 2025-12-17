import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('fitness_app.db');

export const initDatabase = () => {
  // We removed DROP TABLE so users aren't deleted on every refresh
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      age TEXT,
      weight TEXT,
      height TEXT,
      fitnessLevel TEXT,
      fitnessGoal TEXT
    );
  `);
};

export const registerUser = (username, email, password, age, weight, height, fitnessLevel, fitnessGoal) => {
  return db.runSync(
    'INSERT INTO users (username, email, password, age, weight, height, fitnessLevel, fitnessGoal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [username, email, password, age, weight, height, fitnessLevel, fitnessGoal]
  );
};

export const loginUser = (email, password) => {
  return db.getFirstSync(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password]
  );
};

export default db;