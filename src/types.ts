export type Grade = '6' | '7' | '8' | '9';

export interface TheorySection {
  introduction: string;
  keyPoints: string[];
  formulas: { title: string; latex: string; explanation: string }[];
  examples: { question: string; solution: string; steps: string[] }[];
}

export interface Exercise {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text';
  options?: string[]; // For multiple choice
  correctAnswer: string;
  stepByStep: string[]; // Detailed explanation
}

export interface MathTopic {
  id: string;
  grade: Grade;
  category: 'algebra' | 'geometry'; // Đại số | Hình học
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  theory: TheorySection;
  exercises: Exercise[];
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActive: string | null;
  completedTopics: string[]; // List of topic IDs completed
  completedExercises: string[]; // List of exercise IDs solved correctly
  savedQueries: { id: string; query: string; response: string; timestamp: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
