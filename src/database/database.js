import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('fitness_app.db');

export const initDatabase = () => {
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

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      timestamp TEXT,
      intensity TEXT,
      xpEarned INTEGER DEFAULT 0,
      details TEXT,
      status TEXT DEFAULT 'Complete',
      imageUri TEXT
    );

    /* NUTRITION TABLE INTEGRATION */
    CREATE TABLE IF NOT EXISTS nutrition_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      foodName TEXT,
      calories INTEGER,
      protein INTEGER,
      carbs INTEGER,
      fat INTEGER,
      fiber INTEGER,
      grade TEXT,
      recommendation TEXT,
      date TEXT
    );
  `);

  try {
    const tableInfo = db.getAllSync("PRAGMA table_info(workouts)");
    const hasImageUri = tableInfo.some(col => col.name === 'imageUri');
    if (!hasImageUri) {
      db.execSync("ALTER TABLE workouts ADD COLUMN imageUri TEXT;");
    }
  } catch (e) {
    console.log("Migration check handled");
  }
};

/* --- NUTRITION PERSISTENCE FUNCTIONS --- */
export const saveMealToDB = (userId, meal) => {
  const today = new Date().toISOString().split('T')[0];
  return db.runSync(
    'INSERT INTO nutrition_logs (userId, foodName, calories, protein, carbs, fat, fiber, grade, recommendation, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, meal.foodName, meal.calories, meal.protein, meal.carbs, meal.fat, meal.fiber, meal.grade, meal.recommendation, today]
  );
};

export const getMealsForToday = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return db.getAllSync(
    'SELECT * FROM nutrition_logs WHERE userId = ? AND date = ? ORDER BY id DESC',
    [userId, today]
  );
};

export const deleteMealFromDB = (mealId) => {
  return db.runSync('DELETE FROM nutrition_logs WHERE id = ?', [mealId]);
};

/* --- KEEPING ALL YOUR EXISTING CODE BELOW --- */
export const registerUser = (username, email, password, age, weight, height, fitnessLevel, fitnessGoal) => {
  return db.runSync(
    'INSERT INTO users (username, email, password, age, weight, height, fitnessLevel, fitnessGoal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [username, email, password, age, weight, height, fitnessLevel, fitnessGoal]
  );
};

export const loginUser = (email, password) => {
  return db.getFirstSync('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
};

export const updateUserStatsInDB = (userId, newXp, newLevel) => {
  return db.runSync(
    'UPDATE users SET xp = ?, level = ? WHERE id = ?',
    [newXp, newLevel, userId]
  );
};

export const saveQuestCompletion = (userId, questId) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    return db.runSync(
      'INSERT INTO daily_quests (userId, questId, completionDate) VALUES (?, ?, ?)',
      [userId, questId, today]
    );
  } catch (e) {}
};

export const getTodaysCompletedQuests = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const results = db.getAllSync(
    'SELECT questId FROM daily_quests WHERE userId = ? AND completionDate = ?',
    [userId, today]
  );
  return results.map(row => row.questId);
};

export const logWorkout = (userId, intensity = 'Medium', xp = 0, details = '', status = 'Complete', imageUri = null) => {
  const now = new Date().toISOString();
  return db.runSync(
    'INSERT INTO workouts (userId, timestamp, intensity, xpEarned, details, status, imageUri) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [userId, now, intensity, xp, details, status, imageUri]
  );
};

export const getWorkoutsForToday = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return db.getAllSync(
    "SELECT * FROM workouts WHERE userId = ? AND timestamp LIKE ?",
    [userId, `${today}%`]
  );
};

export const getAllWorkouts = (userId) => {
  return db.getAllSync(
    'SELECT * FROM workouts WHERE userId = ? ORDER BY timestamp DESC',
    [userId]
  );
};

export const deleteWorkout = (workoutId) => {
  return db.runSync('DELETE FROM workouts WHERE id = ?', [workoutId]);
};

export const getWorkoutStreak = (userId) => {
  const workouts = db.getAllSync(
    'SELECT DISTINCT SUBSTR(timestamp, 1, 10) as workoutDate FROM workouts WHERE userId = ? ORDER BY workoutDate DESC',
    [userId]
  );

  if (workouts.length === 0) return 0;

  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const latestWorkoutDate = new Date(workouts[0].workoutDate);
  latestWorkoutDate.setHours(0, 0, 0, 0);

  const diffInDays = Math.floor((today - latestWorkoutDate) / (1000 * 60 * 60 * 24));
  if (diffInDays > 1) return 0;

  let checkDate = latestWorkoutDate;

  for (let i = 0; i < workouts.length; i++) {
    const workoutDate = new Date(workouts[i].workoutDate);
    workoutDate.setHours(0, 0, 0, 0);

    if (workoutDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break; 
    }
  }
  return streak;
};

export default db;