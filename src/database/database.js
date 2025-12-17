import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('fitness_app.db');

export const initDatabase = () => {
  // Create tables
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
      fitnessGoal TEXT,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS daily_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      questId TEXT,
      completionDate TEXT,
      UNIQUE(userId, questId, completionDate)
    );
  `);

  // Migrations for existing users
  try { db.execSync("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0;"); } catch (e) {}
  try { db.execSync("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;"); } catch (e) {}
};

// --- User Auth Functions ---
export const registerUser = (username, email, password, age, weight, height, fitnessLevel, fitnessGoal) => {
  return db.runSync(
    'INSERT INTO users (username, email, password, age, weight, height, fitnessLevel, fitnessGoal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [username, email, password, age, weight, height, fitnessLevel, fitnessGoal]
  );
};

export const loginUser = (email, password) => {
  return db.getFirstSync('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
};

// --- Progress Persistence Functions ---

/** Updates the user's XP and Level in the DB */
export const updateUserStatsInDB = (userId, newXp, newLevel) => {
  return db.runSync(
    'UPDATE users SET xp = ?, level = ? WHERE id = ?',
    [newXp, newLevel, userId]
  );
};

/** Records a quest as completed for today */
export const saveQuestCompletion = (userId, questId) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    return db.runSync(
      'INSERT INTO daily_quests (userId, questId, completionDate) VALUES (?, ?, ?)',
      [userId, questId, today]
    );
  } catch (e) {
    console.log("Quest already marked completed in DB");
  }
};

/** Fetches IDs of quests completed today */
export const getTodaysCompletedQuests = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const results = db.getAllSync(
    'SELECT questId FROM daily_quests WHERE userId = ? AND completionDate = ?',
    [userId, today]
  );
  return results.map(row => row.questId);
};

export default db;