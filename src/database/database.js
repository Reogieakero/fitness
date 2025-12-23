import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('fitness_app.db');

export const initDatabase = () => {
  // Initialize Tables
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
      level INTEGER DEFAULT 1,
      profileImage TEXT
    );

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

    CREATE TABLE IF NOT EXISTS daily_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      questId TEXT,
      completionDate TEXT,
      UNIQUE(userId, questId, completionDate)
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      planJson TEXT,
      date TEXT,
      UNIQUE(userId, date)
    );
  `);

  try {
    db.runSync('ALTER TABLE users ADD COLUMN profileImage TEXT;');
  } catch (e) {}
};

export const checkUserExists = (email) => {
  return db.getFirstSync('SELECT id FROM users WHERE email = ?', [email]);
};

export const getUserStats = (userId) => {
  return db.getFirstSync('SELECT age, weight, height, fitnessLevel, fitnessGoal, xp, level FROM users WHERE id = ?', [userId]);
};

export const loginUser = (email, password) => {
  return db.getFirstSync('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
};

export const registerUser = (username, email, password, age, weight, height, fitnessLevel, fitnessGoal) => {
  return db.runSync(
    'INSERT INTO users (username, email, password, age, weight, height, fitnessLevel, fitnessGoal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [username, email, password, age, weight, height, fitnessLevel, fitnessGoal]
  );
};


export const saveMealToDB = (userId, meal) => {
  const entryDate = meal.date || new Date().toISOString().split('T')[0];
  return db.runSync(
    'INSERT INTO nutrition_logs (userId, foodName, calories, protein, carbs, fat, fiber, grade, recommendation, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, meal.foodName, Math.round(Number(meal.calories)) || 0, Math.round(Number(meal.protein)) || 0, Math.round(Number(meal.carbs)) || 0, Math.round(Number(meal.fat)) || 0, Math.round(Number(meal.fiber)) || 0, meal.grade || 'B', meal.recommendation || 'Logged entry', entryDate]
  );
};

export const getMealsByDate = (userId, date) => {
  return db.getAllSync('SELECT * FROM nutrition_logs WHERE userId = ? AND date = ? ORDER BY id DESC', [userId, date]);
};

export const getMealsForToday = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return getMealsByDate(userId, today);
};

export const getAllMealDates = (userId) => {
  const results = db.getAllSync('SELECT DISTINCT date FROM nutrition_logs WHERE userId = ? ORDER BY date DESC', [userId]);
  return results.map(row => row.date);
};

export const deleteMealFromDB = (mealId) => {
  return db.runSync('DELETE FROM nutrition_logs WHERE id = ?', [mealId]);
};

export const updateUserStatsInDB = (userId, newXp, newLevel) => {
  return db.runSync('UPDATE users SET xp = ?, level = ? WHERE id = ?', [newXp, newLevel, userId]);
};

export const logWorkout = (userId, intensity = 'Medium', xp = 0, details = '', status = 'Complete', imageUri = null) => {
  const now = new Date().toISOString();
  return db.runSync('INSERT INTO workouts (userId, timestamp, intensity, xpEarned, details, status, imageUri) VALUES (?, ?, ?, ?, ?, ?, ?)', [userId, now, intensity, xp, details, status, imageUri]);
};

export const getWorkoutsForToday = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return db.getAllSync("SELECT * FROM workouts WHERE userId = ? AND timestamp LIKE ?", [userId, `${today}%`]);
};

export const getAllWorkouts = (userId) => {
  return db.getAllSync('SELECT * FROM workouts WHERE userId = ? ORDER BY timestamp DESC', [userId]);
};

export const deleteWorkout = (workoutId) => {
  return db.runSync('DELETE FROM workouts WHERE id = ?', [workoutId]);
};

export const saveQuestCompletion = (userId, questId) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    return db.runSync('INSERT INTO daily_quests (userId, questId, completionDate) VALUES (?, ?, ?)', [userId, questId, today]);
  } catch (e) { console.log("Quest already completed today"); }
};

export const getTodaysCompletedQuests = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const results = db.getAllSync('SELECT questId FROM daily_quests WHERE userId = ? AND completionDate = ?', [userId, today]);
  return results.map(row => row.questId);
};

export const getWorkoutStreak = (userId) => {
  const workouts = db.getAllSync("SELECT DISTINCT SUBSTR(timestamp, 1, 10) as workoutDate FROM workouts WHERE userId = ? AND status = 'Complete' ORDER BY workoutDate DESC", [userId]);
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
    } else { break; }
  }
  return streak;
};

export const getTodayTotalCalories = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const result = db.getFirstSync('SELECT SUM(calories) as total FROM nutrition_logs WHERE userId = ? AND date = ?', [userId, today]);
  return result?.total || 0;
};

export const getWeeklyWorkoutDistribution = (userId) => {
  const results = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' }); 
    const row = db.getFirstSync("SELECT COUNT(*) as count FROM workouts WHERE userId = ? AND timestamp LIKE ? AND status = 'Complete'", [userId, `${dateStr}%`]);
    results.push({ label: dayName, value: row?.count || 0 });
  }
  return results;
};

export const getTotalQuestCount = (userId) => {
  const result = db.getFirstSync('SELECT COUNT(*) as total FROM daily_quests WHERE userId = ?', [userId]);
  return result?.total || 0;
};

export const getDetailedQuestHistory = (userId) => {
  return db.getAllSync('SELECT questId, completionDate FROM daily_quests WHERE userId = ? ORDER BY completionDate DESC', [userId]);
};

export const getLifetimeNutrients = (userId) => {
  return db.getFirstSync('SELECT SUM(calories) as cal, SUM(protein) as pro, SUM(carbs) as carb, SUM(fat) as fat FROM nutrition_logs WHERE userId = ?', [userId]);
};

export const getFullUser = (userId) => {
  return db.getFirstSync('SELECT * FROM users WHERE id = ?', [userId]);
};

export const updateUserProfile = (userId, username, age, weight, height, goal) => {
  return db.runSync('UPDATE users SET username = ?, age = ?, weight = ?, height = ?, fitnessGoal = ? WHERE id = ?', [username, age, weight, height, goal, userId]);
};

export const updateUserProfileImage = (userId, imageUri) => {
  return db.runSync('UPDATE users SET profileImage = ? WHERE id = ?', [imageUri, userId]);
};

export default db;