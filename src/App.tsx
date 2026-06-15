import React, { useState, useEffect, FormEvent } from 'react';
import { 
  BookOpen, 
  Award, 
  Flame, 
  Lightbulb, 
  CheckCircle2, 
  X, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Cpu, 
  Brain, 
  Send, 
  HelpCircle,
  FolderOpen,
  HelpCircle as QuestionIcon,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
  Lock,
  Trash2,
  Check,
  Pencil
} from 'lucide-react';
import { Grade, MathTopic, UserProgress, Exercise } from './types';
import { CURRICULUM } from './data/curriculum';
import TutorChat from './components/TutorChat';
import MathRenderer from './components/MathRenderer';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // State for user tracking
  const [progress, setProgress] = useState<UserProgress>({
    xp: 150,
    streak: 3,
    lastActive: new Date().toISOString(),
    completedTopics: [],
    completedExercises: [],
    savedQueries: []
  });

  // UI States
  const [selectedGrade, setSelectedGrade] = useState<Grade>('6');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'algebra' | 'geometry'>('all');
  const [activeTopic, setActiveTopic] = useState<MathTopic | null>(null);
  const [activeTab, setActiveTab] = useState<'theory' | 'practice' | 'chat'>('theory');

  // Exercise interactive states
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, { isCorrect: boolean; showExplanation: boolean }>>({});
  const [topicExercises, setTopicExercises] = useState<Exercise[]>([]);
  const [generatingEx, setGeneratingEx] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khá' | 'Khó'>('Trung bình');

  // Smart AI Solver Tool states
  const [solverQuery, setSolverQuery] = useState('');
  const [solverResult, setSolverResult] = useState<string | null>(null);
  const [solverLoading, setSolverLoading] = useState(false);
  const [solverError, setSolverError] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState({ hasKey: false, message: '' });

  // Admin & Custom Topics States
  const [customTopics, setCustomTopics] = useState<MathTopic[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [deletedTopicIds, setDeletedTopicIds] = useState<string[]>([]);
  
  // Load overridden keyPoints
  const [keyPointsOverrides, setKeyPointsOverrides] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('thcs_math_keypoints_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const [editingKeyPointIndex, setEditingKeyPointIndex] = useState<number | null>(null);
  const [editingKeyPointText, setEditingKeyPointText] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Load progress, custom topics and admin token from localStorage & server
  useEffect(() => {
    const saved = localStorage.getItem('thcs_math_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing progress', e);
      }
    }

    // Load custom topics if cached
    const localCustom = localStorage.getItem('thcs_math_custom_topics');
    if (localCustom) {
      try {
        setCustomTopics(JSON.parse(localCustom));
      } catch (e) {
        console.error('Lỗi phân tích chủ đề địa phương:', e);
      }
    }

    // Load token
    const savedToken = localStorage.getItem('thcs_math_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdmin(true);
    }

    // Load deleted topic ids
    const savedDeleted = localStorage.getItem('thcs_math_deleted_topics');
    if (savedDeleted) {
      try {
        setDeletedTopicIds(JSON.parse(savedDeleted));
      } catch (e) {
        console.error('Lỗi định dạng danh sách chủ đề đã xóa:', e);
      }
    }

    checkApiKeyStatus();

    // Pull newest custom topics from server (and sync back local items if empty)
    const fetchCustomTopics = async () => {
      try {
        const res = await fetch('/api/math/custom-topics');
        const data = await res.json();
        if (data.customTopics && data.customTopics.length > 0) {
          setCustomTopics(data.customTopics);
          localStorage.setItem('thcs_math_custom_topics', JSON.stringify(data.customTopics));
        } else if (localCustom && savedToken) {
          // Send back cached items in case server restarted empty
          try {
            const items = JSON.parse(localCustom);
            for (const topic of items) {
              await fetch('/api/math/custom-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, token: savedToken })
              });
            }
          } catch (_) {}
        }
      } catch (e) {
        console.error('Lỗi khi tải hoặc đồng bộ chủ đề bổ sung:', e);
      }
    };
    fetchCustomTopics();
  }, []);

  // Save progress helper
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('thcs_math_progress', JSON.stringify(newProgress));
  };

  const checkApiKeyStatus = async () => {
    try {
      const res = await fetch('/api/math/status');
      const data = await res.json();
      setApiKeyStatus(data);
    } catch (e) {
      // Ignore
    }
  };

  // Combine static CURRICULUM and dynamic customTopics, filtering out deleted ones, merging keyPoints overrides
  const allTopics = [...CURRICULUM, ...customTopics]
    .filter(topic => !deletedTopicIds.includes(topic.id))
    .map(topic => {
      const over = keyPointsOverrides[topic.id];
      if (over) {
        return {
          ...topic,
          theory: {
            ...topic.theory,
            keyPoints: over
          }
        };
      }
      return topic;
    });

  // Filter topics based on grade & category
  const filteredTopics = allTopics.filter(topic => {
    const matchGrade = topic.grade === selectedGrade;
    const matchCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchGrade && matchCategory;
  });

  const handleAddNewTopicFromAdmin = (newTopic: MathTopic) => {
    setCustomTopics(prev => {
      const updated = [...prev, newTopic];
      localStorage.setItem('thcs_math_custom_topics', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateKeyPointsList = async (topicId: string, updatedKeyPoints: string[]) => {
    // 1. Update the local overrides state
    setKeyPointsOverrides(prev => {
      const newCtx = {
        ...prev,
        [topicId]: updatedKeyPoints
      };
      localStorage.setItem('thcs_math_keypoints_overrides', JSON.stringify(newCtx));
      return newCtx;
    });

    // 2. Also update in the activeTopic if selected
    if (activeTopic && activeTopic.id === topicId) {
      setActiveTopic(prev => {
        if (!prev) return null;
        return {
          ...prev,
          theory: {
            ...prev.theory,
            keyPoints: updatedKeyPoints
          }
        };
      });
    }

    // 3. Update the matching topic inside customTopics state (if it is a custom topic)
    const isCustom = topicId.startsWith('custom-topic-') || topicId.startsWith('custom-topic-ai-');
    if (isCustom) {
      const topicObj = customTopics.find(t => t.id === topicId);
      if (topicObj) {
        const updatedTopicObj: MathTopic = {
          ...topicObj,
          theory: {
            ...topicObj.theory,
            keyPoints: updatedKeyPoints
          }
        };

        // Update in customTopics state
        setCustomTopics(prev => {
          const idx = prev.findIndex(t => t.id === topicId);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = updatedTopicObj;
            localStorage.setItem('thcs_math_custom_topics', JSON.stringify(copy));
            return copy;
          }
          return prev;
        });

        // 4. Sync with server via PUT
        try {
          await fetch(`/api/math/custom-topics/${topicId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: updatedTopicObj, token: adminToken })
          });
        } catch (err) {
          console.error('Lỗi khi cập nhật chủ đề trên máy chủ:', err);
        }
      }
    }
  };

  // Handle Deleting dry topic from client & server (only if admin)
  const handleDeleteTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa chủ đề',
      message: 'Bạn có chắc chắn muốn xóa chủ đề này hoàn toàn khỏi hệ thống không?',
      onConfirm: async () => {
        // Add to deleted/hidden list
        const updatedDeleted = [...deletedTopicIds, topicId];
        setDeletedTopicIds(updatedDeleted);
        localStorage.setItem('thcs_math_deleted_topics', JSON.stringify(updatedDeleted));

        // Deselect if active
        if (activeTopic?.id === topicId) {
          setActiveTopic(null);
        }

        // Call API if custom topic
        if (topicId.startsWith('custom-topic-') || topicId.startsWith('custom-topic-ai-')) {
          try {
            const res = await fetch(`/api/math/custom-topics/${topicId}?token=${adminToken || ''}`, {
              method: 'DELETE'
            });
            if (res.ok) {
              setCustomTopics(prev => {
                const updated = prev.filter(t => t.id !== topicId);
                localStorage.setItem('thcs_math_custom_topics', JSON.stringify(updated));
                return updated;
              });
            } else {
              const errData = await res.json();
              alert(errData.error || 'Xảy ra lỗi khi xóa chủ đề từ máy chủ.');
            }
          } catch (err) {
            console.error('Lỗi khi xóa chủ đề:', err);
          }
        }
      }
    });
  };

  // Handle selecting a topic
  const handleSelectTopic = (topic: MathTopic) => {
    setActiveTopic(topic);
    setActiveTab('theory');
    setTopicExercises(topic.exercises);
    setUserAnswers({});
    setSubmittedAnswers({});
    setGenerationError(null);
  };

  // Handle practice answer change
  const handleAnswerChange = (exId: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [exId]: value }));
  };

  // Handle checking exercises
  const handleCheckAnswer = (ex: Exercise) => {
    const userAnswer = (userAnswers[ex.id] || '').trim().toLowerCase();
    const correctAnswer = ex.correctAnswer.trim().toLowerCase();
    
    // Simple normalize comparisons
    const isCorrect = userAnswer === correctAnswer || 
                      userAnswer.replace(/\s+/g, '') === correctAnswer.replace(/\s+/g, '') ||
                      (ex.type === 'multiple-choice' && userAnswer.startsWith(correctAnswer)) ||
                      (userAnswer.length > 0 && correctAnswer.startsWith(userAnswer));

    const isExCompletedBefore = progress.completedExercises.includes(ex.id);
    
    // Calculate new XP
    let xpGain = 0;
    let updatedCompletedEx = [...progress.completedExercises];
    
    if (isCorrect && !isExCompletedBefore) {
      xpGain = 25;
      updatedCompletedEx.push(ex.id);
    }

    setSubmittedAnswers(prev => ({
      ...prev,
      [ex.id]: { isCorrect, showExplanation: isCorrect } // Auto show step-by-step if correct
    }));

    if (isCorrect) {
      const newProgress: UserProgress = {
        ...progress,
        xp: progress.xp + xpGain,
        completedExercises: updatedCompletedEx,
        streak: progress.streak === 0 ? 1 : progress.streak
      };
      
      // Update finished topic if all correct
      if (activeTopic) {
        const allOriginalSolved = activeTopic.exercises.every(e => 
          e.id === ex.id ? true : updatedCompletedEx.includes(e.id)
        );
        if (allOriginalSolved && !progress.completedTopics.includes(activeTopic.id)) {
          newProgress.completedTopics.push(activeTopic.id);
          newProgress.xp += 100; // Bonus to complete topic
        }
      }
      
      saveProgress(newProgress);
    }
  };

  // Trigger toggle explanation
  const toggleExplanation = (exId: string) => {
    setSubmittedAnswers(prev => {
      const state = prev[exId] || { isCorrect: false, showExplanation: false };
      return {
        ...prev,
        [exId]: { ...state, showExplanation: !state.showExplanation }
      };
    });
  };

  // Generate new exercise utilizing active topic context and the express server endpoint
  const handleGenerateAIExercise = async () => {
    if (!activeTopic || generatingEx) return;
    setGeneratingEx(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/math/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: activeTopic.id,
          topicTitle: activeTopic.title,
          topicDescription: activeTopic.description,
          grade: activeTopic.grade,
          category: activeTopic.category,
          difficulty: aiDifficulty
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi từ phía cụm máy chủ AI.');
      }

      if (data.exercises && data.exercises.length > 0) {
        // Only display the newly generated exercises from this recommendation request
        const exercisesWithUniqueIds = data.exercises.map((ex: any, index: number) => {
          const uniqueId = `ai-ex-${activeTopic.id}-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;
          return {
            ...ex,
            id: uniqueId
          };
        });
        setTopicExercises(exercisesWithUniqueIds);
        setProgress(prev => ({ ...prev, xp: prev.xp + 10 })); // Extra query bonus xp
      } else {
        throw new Error('Không tạo được bài mới từ API. Vui lòng kiểm tra lại AI key.');
      }
    } catch (e: any) {
      console.error(e);
      setGenerationError(e.message || 'Mất kết nối hoặc sai lệch API Key trong Setup Secrets.');
    } finally {
      setGeneratingEx(false);
    }
  };

  // Request AI Tutor response to explain queries
  const handleSolveQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solverQuery.trim() || solverLoading) return;

    setSolverLoading(true);
    setSolverError(null);
    setSolverResult(null);

    try {
      const res = await fetch('/api/math/explain-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: solverQuery,
          grade: selectedGrade,
          topic: activeTopic ? activeTopic.title : 'Tổng hợp THCS'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gia sư AI bận suy nghĩ. Vui lòng thử lại.');
      }

      setSolverResult(data.explanation);

      // Save to query lists history
      const newQueryItem = {
        id: 'q-' + Date.now(),
        query: solverQuery,
        response: data.explanation,
        timestamp: Date.now()
      };

      const updatedQueries = [newQueryItem, ...progress.savedQueries].slice(0, 10); // Keep last 10
      saveProgress({
        ...progress,
        xp: progress.xp + 15, // Answer reward
        savedQueries: updatedQueries
      });

    } catch (e: any) {
      console.error(e);
      setSolverError(e.message || 'Không thể tính toán giải thuật với AI. Vui lòng kiểm tra thiết lập.');
    } finally {
      setSolverLoading(false);
    }
  };

  // Reset progress helper for troubleshooting
  const handleResetProgress = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cài đặt lại tiến trình',
      message: 'Bạn có chắc chắn muốn cài đặt lại toàn bộ điểm số XP và kết quả học tập không? Thao tác này sẽ đặt lại thành tích ban đầu.',
      onConfirm: () => {
        saveProgress({
          xp: 150,
          streak: 1,
          lastActive: new Date().toISOString(),
          completedTopics: [],
          completedExercises: [],
          savedQueries: []
        });
        setUserAnswers({});
        setSubmittedAnswers({});
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col antialiased">
      
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-indigo-500/10">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Học Toán THCS <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 ml-1.5 border border-indigo-500/30">MATH JUNIOR</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">Sáng lập bởi Hàn Phong</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* XP Tracker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl shadow-inner">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{progress.xp}</span>
              <span className="text-[10px] text-slate-400 font-medium">XP</span>
            </div>

            {/* Streak Tracker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl shadow-inner">
              <Flame className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">{progress.streak}</span>
              <span className="text-[10px] text-slate-400 font-medium">Ngày</span>
            </div>

            {/* Settings Reset Button */}
            <button 
              type="button"
              onClick={handleResetProgress}
              title="Lập lại tiến trình"
              className="p-2 border border-slate-700/60 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Admin Access Panel Button */}
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              title={isAdmin ? "Vào Bảng điều khiển Admin (Đã đăng nhập)" : "Đăng nhập Quyền Admin/Giáo viên"}
              className={`p-2 border rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                isAdmin 
                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 animate-pulse' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span className="hidden md:inline">{isAdmin ? "Bảng điều khiển Giáo viên" : "Ban Giáo viên"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* API Key Banner Prompt if missing */}
      {!apiKeyStatus.hasKey && (
        <div className="bg-amber-950/40 border-b border-amber-800/50 text-amber-200 p-3 text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <p className="font-medium text-amber-300">
                Gia sư AI chưa được kích hoạt: Hãy thiết lập <strong>GEMINI_API_KEY</strong> trong bảng <strong>Settings &gt; Secrets</strong> tại góc màn hình dán mã khóa vào để dùng đầy đủ.
              </p>
            </div>
            <a 
              href="https://ai.google.dev" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 px-3 py-1 rounded-lg font-semibold text-[11px] text-amber-300 transition-all shrink-0"
            >
              Lấy API Key Miễn phí
            </a>
          </div>
        </div>
      )}

      {/* DASHBOARD GRID AND CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FILTERS AND CURRICULUM SELECTOR (Only if no active topic) */}
        <div className={`${activeTopic ? 'hidden lg:block lg:col-span-4' : 'col-span-1/1 lg:col-span-8'} space-y-6 transition-all duration-300`}>
          
          {/* Welcome Dashboard Stats Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Bạn muốn ôn luyện bài Toán nào hôm nay?
                </h2>
                <p className="text-slate-400 text-xs mt-1 max-w-xl">
                  Hệ thống được thiết kế đồng bộ với Chương trình Toán Trung học Cơ sở (từ Lớp 6 đến Lớp 9). Chọn chủ đề bên dưới để bắt đầu tự học khoa học.
                </p>
              </div>
            </div>

            {/* QUICK STATS METRICS */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-800/80">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Đã hoàn thành</span>
                <span className="text-base font-extrabold text-indigo-400 mt-1 block">
                  {progress.completedTopics.length} <span className="text-xs font-normal text-slate-400">chủ đề</span>
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Số bài tự giải</span>
                <span className="text-base font-extrabold text-emerald-400 mt-1 block">
                  {progress.completedExercises.length} <span className="text-xs font-normal text-slate-400">bài</span>
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hạt lượng tử</span>
                <span className="text-base font-extrabold text-purple-400 mt-1 block">
                  {progress.xp} <span className="text-xs font-normal text-slate-400">XP</span>
                </span>
              </div>
            </div>
          </div>

          {/* CHOOSE COURSE FILTER */}
          <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-300">Phân loại theo Khối Học & Thể loại</span>
              </div>
            </div>

            {/* Grades Switcher */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Chọn khối lớp:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['6', '7', '8', '9'] as Grade[]).map(g => (
                    <button
                      id={`grade-btn-${g}`}
                      key={g}
                      type="button"
                      onClick={() => {
                        setSelectedGrade(g);
                        // Clear active topic if the selection goes away to keep view synced
                        if (activeTopic && activeTopic.grade !== g) {
                          setActiveTopic(null);
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedGrade === g
                          ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-md shadow-indigo-600/10'
                          : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-750'
                      }`}
                    >
                      Lớp {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Category switcher */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Chọn phân môn:</span>
                <div className="flex gap-1.5">
                  <button
                    key="all"
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-slate-800 text-indigo-400 border border-indigo-900/50 font-semibold'
                        : 'bg-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tất cả phân môn
                  </button>
                  <button
                    key="algebra"
                    type="button"
                    onClick={() => setSelectedCategory('algebra')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === 'algebra'
                        ? 'bg-slate-850 text-emerald-400 border border-emerald-950 font-semibold'
                        : 'bg-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📐 Đại số
                  </button>
                  <button
                    key="geometry"
                    type="button"
                    onClick={() => setSelectedCategory('geometry')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === 'geometry'
                        ? 'bg-slate-850 text-indigo-400 border border-indigo-950 font-semibold'
                        : 'bg-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📐 Hình học
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MATHEMATICS TOPIC LESSON CARDS GRID */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
              <span>📚 DANH SÁCH CHỦ ĐỀ CHƯƠNG TRÌNH</span>
              <span className="text-[10px] font-normal lowercase">({filteredTopics.length} chủ đề)</span>
            </h3>

            {filteredTopics.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredTopics.map((topic, i) => {
                  const isCompleted = progress.completedTopics.includes(topic.id);
                  const isActive = activeTopic?.id === topic.id;
                  
                  return (
                    <div
                      id={`topic-card-${topic.id}`}
                      key={topic.id}
                      onClick={() => handleSelectTopic(topic)}
                      className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden ${
                        isActive 
                          ? 'bg-slate-850 border-indigo-500 shadow-lg' 
                          : 'bg-slate-900/60 hover:bg-slate-850/80 border-slate-800 hover:border-slate-700/80 shadow-sm'
                      }`}
                    >
                      {/* Ribbon indicator if completed */}
                      {isCompleted && (
                        <div className="absolute top-0 right-0 py-0.5 px-2 bg-emerald-500 text-[9px] font-bold text-slate-950 rounded-bl-lg uppercase">
                          Đã xong
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                              topic.category === 'algebra' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-550/20' 
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-550/20'
                            }`}>
                              {topic.category === 'algebra' ? 'Đại số' : 'Hình học'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                              topic.difficulty === 'easy' ? 'bg-slate-800 text-slate-400' :
                              topic.difficulty === 'medium' ? 'bg-amber-950/20 text-amber-400 border border-amber-900/30' :
                              'bg-red-950/20 text-red-400 border border-red-900/30'
                            }`}>
                              Cấp độ: {topic.difficulty === 'easy' ? 'Nhận biết' : topic.difficulty === 'medium' ? 'Khá' : 'Vận dụng'}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors font-sans">
                            {topic.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {topic.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0 mt-1.5">
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTopic(topic.id, e)}
                              title="Xóa chủ đề này khỏi danh sách"
                              className="p-1.5 bg-red-950/20 hover:bg-red-600 border border-red-900/40 hover:border-red-500 rounded-lg text-red-400 hover:text-white transition-all cursor-pointer z-10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/60 text-slate-500 text-xs">
                Không tìm thấy chủ đề nào phù hợp cho phân loại này.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN OR EXPANDED STUDY PANEL */}
        <div className={`${activeTopic ? 'col-span-1/1 lg:col-span-8' : 'col-span-1/1 lg:col-span-4'} space-y-6`}>
          
          {/* SỐ 1: HỌC LIỆU VÀ GIA SƯ TOÁN CHỦ ĐỀ CHỌN LỰA */}
          {activeTopic ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
              
              {/* Back to Home Button on mobile */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTopic(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-semibold border border-slate-750 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại mục lục
                </button>

                <div className="text-right">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">CHỦ ĐỀ LỚP {activeTopic.grade}</span>
                  <span className="text-xs font-bold text-slate-100 truncate max-w-[200px] block">{activeTopic.title}</span>
                </div>
              </div>

              {/* Tabs selector */}
              <div className="flex border-b border-slate-800 gap-1.5 mb-5 p-1 bg-slate-950 rounded-xl">
                <button
                  id="tab-theory"
                  type="button"
                  onClick={() => setActiveTab('theory')}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'theory' 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Lý Thuyết Trọng Tâm
                </button>
                <button
                  id="tab-practice"
                  type="button"
                  onClick={() => setActiveTab('practice')}
                  className={`flex-1 py-2 text-center text-xs font-body font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'practice' 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Bài Tập Thực Hành
                  <span className="px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded text-[9px] inline-block font-normal">
                    {topicExercises.length}
                  </span>
                </button>
                <button
                  id="tab-chat"
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'chat' 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Hỏi Gia sư AI
                </button>
              </div>

              {/* TAB CONTENT: 1. THEORY */}
              {activeTab === 'theory' && (
                <div id="content-theory" className="space-y-6 text-left">
                  
                  {/* Lesson Intro */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider block">Giới thiệu tổng quan</h5>
                    <p className="text-[13px] text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                      {activeTopic.theory.introduction}
                    </p>
                  </div>

                  {/* Key points to memorize */}
                  <div className="space-y-2.5">
                    <h5 className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider block">✍️ Kiến thức trọng tâm cần nhớ</h5>
                    <ul className="grid grid-cols-1 gap-2">
                      {activeTopic.theory.keyPoints.map((point, index) => {
                        const isEditingThis = editingKeyPointIndex === index;
                        return (
                          <li key={index} className="flex gap-2.5 items-start text-xs text-slate-300 bg-slate-950/20 px-3.5 py-2.5 rounded-xl border border-slate-850/60 group relative">
                            <div className="w-5 h-5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 select-none">
                              {index + 1}
                            </div>
                            
                            {isEditingThis ? (
                              <div className="flex-1 flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={editingKeyPointText}
                                  onChange={(e) => setEditingKeyPointText(e.target.value)}
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                                  placeholder="Nhập nội dung kiến thức cốt lõi..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const updatedList = [...activeTopic.theory.keyPoints];
                                      updatedList[index] = editingKeyPointText.trim();
                                      handleUpdateKeyPointsList(activeTopic.id, updatedList);
                                      setEditingKeyPointIndex(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingKeyPointIndex(null);
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  title="Lưu"
                                  onClick={() => {
                                    const updatedList = [...activeTopic.theory.keyPoints];
                                    updatedList[index] = editingKeyPointText.trim();
                                    handleUpdateKeyPointsList(activeTopic.id, updatedList);
                                    setEditingKeyPointIndex(null);
                                  }}
                                  className="p-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 rounded-lg text-emerald-400 cursor-pointer flex items-center justify-center"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Hủy"
                                  onClick={() => setEditingKeyPointIndex(null)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 cursor-pointer flex items-center justify-center"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 flex justify-between items-start gap-3">
                                <span className="leading-relaxed"><MathRenderer text={point} /></span>
                                
                                {isAdmin && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
                                    <button
                                      type="button"
                                      title="Chỉnh sửa dòng này"
                                      onClick={() => {
                                        setEditingKeyPointIndex(index);
                                        setEditingKeyPointText(point);
                                      }}
                                      className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-indigo-400 cursor-pointer flex items-center justify-center"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Xóa dòng này"
                                      onClick={() => {
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: 'Xóa kiến thức trọng tâm',
                                          message: `Bạn thực sự muốn xóa nội dung ghi nhớ này khỏi chủ đề?`,
                                          onConfirm: () => {
                                            const updatedList = activeTopic.theory.keyPoints.filter((_, idx) => idx !== index);
                                            handleUpdateKeyPointsList(activeTopic.id, updatedList);
                                          }
                                        });
                                      }}
                                      className="p-1 bg-slate-800 hover:bg-red-950 border border-slate-755 hover:border-red-900 rounded-lg text-red-400 cursor-pointer flex items-center justify-center"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {isAdmin && (
                      <div className="flex justify-start mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newIndex = activeTopic.theory.keyPoints.length;
                            const updatedList = [...activeTopic.theory.keyPoints, 'Ghi nhớ kiến thức cốt lõi mới...'];
                            handleUpdateKeyPointsList(activeTopic.id, updatedList);
                            setEditingKeyPointIndex(newIndex);
                            setEditingKeyPointText('Ghi ghi nhớ mới ở đây...');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-bold text-indigo-400 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm dòng kiến thức ghi nhớ
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Scientific Formulas & LaTeX syntax */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider block">📐 Công thức toán học quan trọng</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeTopic.theory.formulas.map((form, index) => (
                        <div key={index} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-450 uppercase block">{form.title}</span>
                            <div className="my-2.5 py-2 bg-slate-900 border border-slate-800/80 rounded-lg text-center overflow-x-auto text-indigo-300 text-sm">
                              <MathRenderer text={form.latex} block />
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 italic block mt-1">
                            * {form.explanation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Standard Workings Examples with expandable step workings */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider block">💡 Ví dụ mẫu có lời giải chi tiết</h5>
                    <div className="space-y-3">
                      {activeTopic.theory.examples.map((ex, index) => (
                        <div key={index} className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
                          <div className="bg-slate-850/80 px-4 py-2.5 border-b border-slate-800">
                            <span className="text-xs font-bold text-indigo-300">Ví dụ {index + 1}: <MathRenderer text={ex.question} /></span>
                          </div>
                          <div className="p-4 space-y-3">
                            <span className="text-xs font-medium text-slate-300 block italic">Phương pháp giải: <MathRenderer text={ex.solution} /></span>
                            <div className="border-t border-slate-850 pt-3 space-y-2">
                              {ex.steps.map((step, sIdx) => (
                                <div key={sIdx} className="text-xs text-slate-405 pl-2 border-l border-indigo-600/40 py-0.5 leading-relaxed">
                                  <MathRenderer text={step} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: 2. INTERACTIVE PRACTICE EXERCISES */}
              {activeTab === 'practice' && (
                <div id="content-practice" className="space-y-6 text-left">
                  
                  {/* Practice Heading with Level Selector */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-850">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-300 uppercase">Hệ thống bài tập rèn luyện</h4>
                      <p className="text-[11px] text-slate-400">Tự nhập kết quả hoặc tích chọn đáp án. AI sẽ hướng dẫn giải từng bước.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 px-2 select-none">Mức độ AI:</span>
                        {(['Dễ', 'Trung bình', 'Khá', 'Khó'] as const).map((level) => {
                          const isSelected = aiDifficulty === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setAiDifficulty(level)}
                              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateAIExercise}
                        disabled={generatingEx}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white hover:text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-violet-200" />
                        {generatingEx ? `Đang tạo [${aiDifficulty}]...` : `Đề xuất bài ${aiDifficulty} +`}
                      </button>
                    </div>
                  </div>

                  {generationError && (
                    <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-300 text-xs rounded-xl">
                      {generationError}
                    </div>
                  )}

                  {/* Exercice List */}
                  <div className="space-y-4">
                    {topicExercises.map((ex, idx) => {
                      const isSubmitted = ex.id in submittedAnswers;
                      const submission = submittedAnswers[ex.id];
                      const isCorrect = submission?.isCorrect;
                      const hasCompletedBefore = progress.completedExercises.includes(ex.id);

                      return (
                        <div key={ex.id} style={{ id: `exercise-card-${ex.id}` }} className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden p-4 space-y-4">
                          
                          {/* Title & Type */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2">
                            <span className="text-xs font-bold text-indigo-400">Câu {idx + 1}</span>
                            <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 capitalize">
                              {ex.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Điền số / Rút gọn'}
                            </span>
                          </div>

                          {/* Question text */}
                          <p className="text-sm font-semibold text-slate-100"><MathRenderer text={ex.question} /></p>

                          {/* Answers choice logic */}
                          {ex.type === 'multiple-choice' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {ex.options?.map((opt) => {
                                const isChecked = userAnswers[ex.id] === opt;
                                return (
                                  <label 
                                    key={opt}
                                    style={{ id: `option-${opt}` }}
                                    className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                                      isChecked 
                                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-medium' 
                                        : 'bg-slate-900 border-slate-800 text-slate-355 hover:bg-slate-850 hover:border-slate-705'
                                    }`}
                                  >
                                    <input 
                                      type="radio" 
                                      name={`ex-choice-${ex.id}`}
                                      value={opt}
                                      checked={isChecked}
                                      disabled={isSubmitted && isCorrect}
                                      onChange={() => handleAnswerChange(ex.id, opt)}
                                      className="sr-only"
                                    />
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      isChecked ? 'border-indigo-400 bg-indigo-500/20' : 'border-slate-600'
                                    }`}>
                                      {isChecked && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />}
                                    </div>
                                    <span><MathRenderer text={opt} /></span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-2 text-left space-y-1.5">
                              <label htmlFor={`ex-input-${ex.id}`} className="text-[10px] font-bold text-slate-500 uppercase block">Nhập câu trả lời của em:</label>
                              <input 
                                id={`ex-input-${ex.id}`}
                                type="text"
                                value={userAnswers[ex.id] || ''}
                                placeholder="Gõ số hoặc kết quả cuối cùng..."
                                disabled={isSubmitted && isCorrect}
                                onChange={(e) => handleAnswerChange(ex.id, e.target.value)}
                                className="w-full sm:max-w-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                              />
                            </div>
                          )}

                          {/* Check answer button */}
                          <div className="flex flex-wrap gap-2.5 items-center justify-between pt-1.5 border-t border-slate-900">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={!userAnswers[ex.id]}
                                onClick={() => handleCheckAnswer(ex)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isSubmitted && isCorrect
                                    ? 'bg-slate-900 border border-emerald-900/50 text-emerald-400 cursor-not-allowed'
                                    : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/60 cursor-pointer'
                                }`}
                              >
                                {isSubmitted && isCorrect ? '✔️ Đã giải đúng' : 'Kiểm tra đáp số'}
                              </button>

                              {isSubmitted && (
                                <button
                                  type="button"
                                  onClick={() => toggleExplanation(ex.id)}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                                >
                                  {submission.showExplanation ? 'Ẩn lời giải' : 'Xem lời giải'}
                                  {submission.showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>

                            {/* Status XP info */}
                            {hasCompletedBefore && (
                              <span className="text-[11px] text-emerald-400/85 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận 25 XP
                              </span>
                            )}
                          </div>

                          {/* Show validation text */}
                          {isSubmitted && (
                            <div className={`p-3 rounded-lg text-xs space-y-1 ${
                              isCorrect 
                                ? 'bg-emerald-950/30 border border-emerald-800/40 text-emerald-300' 
                                : 'bg-red-950/30 border border-red-800/40 text-red-300'
                            }`}>
                              <p className="font-semibold">{isCorrect ? 'Tuyệt vời! Kết quả hoàn toàn chính xác.' : 'Chưa chính xác rồi em ơi! Trực giác chưa đúng, hãy thử kiểm tra và thực hiện lại nhé.'}</p>
                              {!isCorrect && (
                                <p className="text-[11px] text-red-400/80">
                                  * Em có thể xem gợi ý và lời giải từng bước bên dưới để hiểu phương pháp.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Step-by-Step workthrough displayed block */}
                          {submission?.showExplanation && (
                            <div className="bg-slate-900 border border-indigo-950/80 p-4 rounded-lg space-y-2.5 text-left text-xs animate-fade-in-quick">
                              <span className="font-bold text-indigo-400 block border-b border-slate-850 pb-1.5">📖 Sách giải chi tiết (Hướng dẫn từng bước):</span>
                              <div className="space-y-2">
                                {ex.stepByStep.map((step, idx) => (
                                  <div key={idx} style={{ id: `step-${idx}` }} className="text-slate-300 pl-3 border-l-2 border-indigo-500 py-0.5 leading-relaxed">
                                    <MathRenderer text={step} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB CONTENT: 3. MULTIMODAL TUTOR CHAT WRAPPER */}
              {activeTab === 'chat' && (
                <div style={{ id: 'chat-tutor-container' }} className="h-[460px]">
                  <TutorChat 
                    topicTitle={activeTopic.title} 
                    grade={activeTopic.grade} 
                  />
                </div>
              )}

            </div>
          ) : (
            // No Topic selected default greeting
            <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Chưa chọn chủ đề học tập</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
                  Vui lòng nhấn chọn một chủ đề môn Toán bất kỳ (như Số hữu tỉ, Đại số, Đa thức, Đường tròn) để bước vào phòng tự học trực tuyến.
                </p>
              </div>
            </div>
          )}

          {/* SỐ 2: GIA SƯ AI GIẢI QUYẾT BÀI TOÁN TỰ CHỌN (Smart Solver Box) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-left space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20 shadow-sm shadow-purple-500/5">
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  Gia sư dịch thuật &amp; Hướng dẫn giải
                </h3>
                <p className="text-[10px] text-slate-400">Nhập bất kỳ câu hỏi hoặc bài tập toán THCS nào, AI sẽ phân tích và giải chi tiết.</p>
              </div>
            </div>

            {/* Smart solver action form */}
            <form onSubmit={handleSolveQuery} className="space-y-3">
              <textarea 
                id="solver-textbox animate-pulse"
                value={solverQuery}
                placeholder="Ví dụ: Rút gọn biểu thức P = (x + 2)^2 - x(x - 5)... hoặc giải thích định lý Thales là gì?"
                rows={3}
                onChange={(e) => setSolverQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
              />
              <button
                id="btn-trigger-solve"
                type="submit"
                disabled={!solverQuery.trim() || solverLoading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:tracking-wide disabled:bg-slate-800 disabled:from-slate-800 disabled:to-slate-850 disabled:text-slate-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                {solverLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin shrink-0"></span>
                    Đang giải thuật liên kết với AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    Bắt đầu Hướng dẫn Giải chi tiết
                  </>
                )}
              </button>
            </form>

            {solverError && (
              <div className="p-3 bg-red-950/40 border border-red-900/60 text-red-300 rounded-xl text-xs">
                {solverError}
              </div>
            )}

            {/* Markdown rendered solution steps result */}
            {solverResult && (
              <div id="solver-result" className="bg-slate-950 border border-purple-950/60 rounded-xl p-4 space-y-3 prose prose-invert overflow-auto select-text">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    LỜI GIẢI TỪ GIA SƯ TOÁN HỌC:
                  </span>
                  <button 
                    type="button"
                    onClick={() => setSolverResult(null)} 
                    className="text-[10px] text-slate-450 hover:text-slate-300"
                  >
                    Đóng
                  </button>
                </div>
                {/* Clean inline rendering for markdown output */}
                <div className="text-xs leading-relaxed text-slate-300 space-y-2">
                  <MathRenderer text={solverResult} />
                </div>
                <div className="pt-2 text-[10px] uppercase font-bold text-slate-500 text-center tracking-widest border-t border-slate-900">
                  🎁 Nhận +15 XP năng lượng hoàn thành tự học
                </div>
              </div>
            )}

            {/* Solved History list */}
            {progress.savedQueries.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10pt] font-semibold text-slate-400 block uppercase tracking-wider">Lịch sử bài giải ({progress.savedQueries.length}/10):</span>
                <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto">
                  {progress.savedQueries.map(q => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setSolverQuery(q.query);
                        setSolverResult(q.response);
                      }}
                      className="text-[10px] bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-850 transition-colors truncate max-w-[200px]"
                      title={q.query}
                    >
                      🔍 {q.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* FOOTER VIEW */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/60 py-6 text-center text-slate-500 text-xs text-slate-450">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Math Junior - Hỗ trợ học Toán THCS.</p>
          <p>Tương thích trên điện thoại, máy tính bảng và máy tính để bàn.</p>
        </div>
      </footer>

      {/* ADMIN CONTROL PANEL MODAL */}
      <AdminPanel
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onAddTopic={handleAddNewTopicFromAdmin}
        adminToken={adminToken}
        setAdminToken={setAdminToken}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* CUSTOM CONFIRM DIALOG */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4 text-left select-text">
            <div>
              <h3 className="text-base font-bold text-slate-100">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
