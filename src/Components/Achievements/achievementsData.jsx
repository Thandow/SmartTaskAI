export const ACHIEVEMENTS = [
  { id: "first_task", name: "First Step", description: "Complete your very first task", emoji: "🌟", points: 50, condition: (stats) => stats.tasksCompleted >= 1 },
  { id: "task_5", name: "Getting Started", description: "Complete 5 tasks", emoji: "✅", points: 75, condition: (stats) => stats.tasksCompleted >= 5 },
  { id: "task_25", name: "On a Roll", description: "Complete 25 tasks", emoji: "🔥", points: 100, condition: (stats) => stats.tasksCompleted >= 25 },
  { id: "task_100", name: "Century Club", description: "Complete 100 tasks", emoji: "💯", points: 250, condition: (stats) => stats.tasksCompleted >= 100 },
  { id: "streak_3", name: "3-Day Streak", description: "Use the app 3 days in a row", emoji: "⚡", points: 60, condition: (stats) => stats.streak >= 3 },
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day streak", emoji: "🗡️", points: 150, condition: (stats) => stats.streak >= 7 },
  { id: "streak_30", name: "Monthly Master", description: "Maintain a 30-day streak", emoji: "👑", points: 500, condition: (stats) => stats.streak >= 30 },
  { id: "level_5", name: "Level Up", description: "Reach level 5", emoji: "🚀", points: 200, condition: (stats) => stats.level >= 5 },
  { id: "level_10", name: "Elite Achiever", description: "Reach level 10", emoji: "💎", points: 400, condition: (stats) => stats.level >= 10 },
  { id: "critical_done", name: "Crisis Manager", description: "Complete a critical priority task", emoji: "🎯", points: 80, condition: (stats) => stats.criticalDone >= 1 },
  { id: "early_bird", name: "Early Bird", description: "Complete a task before 9am", emoji: "🌅", points: 60, condition: (stats) => stats.earlyBird },
  { id: "variety", name: "Multi-Tasker", description: "Complete tasks in 5 different categories", emoji: "🎨", points: 120, condition: (stats) => stats.categoriesDone >= 5 },
];

export function checkNewAchievements(stats, existingIds = []) {
  return ACHIEVEMENTS.filter(a => !existingIds.includes(a.id) && a.condition(stats));
}
