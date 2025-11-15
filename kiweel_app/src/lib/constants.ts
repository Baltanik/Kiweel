// Kiweel App Constants
// Branding and configuration constants

export const APP_NAME = "Kiweel";
export const APP_TAGLINE = "Il tuo ecosistema wellness personale";
export const APP_COLOR = "#10B981"; // Green (wellness vibes)

// User Types (Terminologia Kiweel)
export const USER_TYPES = {
  KIWEERS: "KIWEERS", // Utenti normali
  KIWEERIST: "KIWEERIST", // Specialisti/Professionisti
} as const;

export const USER_TYPE_LABELS = {
  KIWEERS: "Kiweers",
  KIWEERIST: "Kiweerist",
} as const;

// Professional Categories (Wellness Only)
export const PROFESSIONAL_CATEGORIES = [
  { id: "PT", label: "Personal Trainer", icon: "💪" },
  { id: "Dietitian", label: "Dietitian", icon: "🥗" },
  { id: "Osteopath", label: "Osteopath", icon: "🦴" },
  { id: "Physiotherapist", label: "Physiotherapist", icon: "🏥" },
  { id: "Coach", label: "Wellness Coach", icon: "🧘" },
] as const;

export type ProfessionType = typeof PROFESSIONAL_CATEGORIES[number]["id"];

// Service Radius Options (km)
export const SERVICE_RADIUS_OPTIONS = [5, 10, 15, 20, 30, 50] as const;

// Fitness Levels
export const FITNESS_LEVELS = [
  { id: "beginner", label: "Principiante" },
  { id: "intermediate", label: "Intermedio" },
  { id: "advanced", label: "Avanzato" },
] as const;

export type FitnessLevel = typeof FITNESS_LEVELS[number]["id"];

// Health Goals (common wellness goals)
export const HEALTH_GOALS = [
  "Perdita peso",
  "Aumento massa muscolare",
  "Miglioramento flessibilità",
  "Riduzione stress",
  "Miglioramento postura",
  "Recupero infortunio",
  "Preparazione atletica",
  "Benessere generale",
] as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PRO: "pro",
  BUSINESS: "business",
} as const;

// Token Economy Constants
export const TOKEN_REWARDS = {
  DAILY_CHECK_IN: 5,
  POST_PUBLISHED: 5,
  COMMENT_POSTED: 2,
  BOOKING_COMPLETED: 50,
  DIET_PLAN_FOLLOWED_WEEK: 100,
  WORKOUT_COMPLETED: 10,
  MISSION_COMPLETED: 50,
} as const;

// Mission Types
export const MISSION_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MILESTONE: "milestone",
} as const;

// Shared Data Types
export const SHARED_DATA_TYPES = {
  DIET_PLAN: "diet_plan",
  WORKOUT_PLAN: "workout_plan",
  DIAGNOSIS: "diagnosis",
  PROGRESS: "progress",
  PRESCRIPTION: "prescription",
} as const;

// Post Categories (Kiweel Feed)
export const POST_CATEGORIES = [
  { id: "showcase", label: "Work Showcase", icon: "📸" },
  { id: "tip", label: "Wellness Tip", icon: "💡" },
  { id: "achievement", label: "Client Achievement", icon: "🏆" },
  { id: "milestone", label: "Milestone", icon: "🎯" },
  { id: "transformation", label: "Transformation", icon: "✨" },
] as const;

export type PostCategory = typeof POST_CATEGORIES[number]["id"];

// Workout Program Types
export const WORKOUT_PROGRAM_TYPES = [
  { id: "strength", label: "Forza" },
  { id: "cardio", label: "Cardio" },
  { id: "flexibility", label: "Flessibilità" },
  { id: "mixed", label: "Misto" },
] as const;

export type WorkoutProgramType = typeof WORKOUT_PROGRAM_TYPES[number]["id"];

