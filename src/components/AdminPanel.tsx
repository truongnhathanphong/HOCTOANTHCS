import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Plus, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  User,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import { Grade, MathTopic, Exercise } from '../types';
import MathRenderer from './MathRenderer';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTopic: (topic: MathTopic) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  onAddTopic,
  adminToken,
  setAdminToken,
  isAdmin,
  setIsAdmin,
}: AdminPanelProps) {
  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Form States for Topic
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState<Grade>('6');
  const [category, setCategory] = useState<'algebra' | 'geometry'>('algebra');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [theoryIntro, setTheoryIntro] = useState('');
  
  // Custom arrays
  const [keyPoints, setKeyPoints] = useState<string[]>(['']);
  const [formulas, setFormulas] = useState<{ title: string; latex: string; explanation: string }[]>([
    { title: '', latex: '', explanation: '' }
  ]);
  const [examples, setExamples] = useState<{ question: string; solution: string; steps: string[] }[]>([
    { question: '', solution: '', steps: [''] }
  ]);
  
  // Custom Exercises
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: 'ex-1',
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      stepByStep: ['']
    },
    {
      id: 'ex-2',
      question: '',
      type: 'text',
      correctAnswer: '',
      stepByStep: ['']
    }
  ]);

  // AI Generation status
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  // Math view preview toggles
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  // Handle Login Flow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Vui lòng điền đầy đủ tài khoản và mật khẩu.');
      return;
    }
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/math/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập không thành công.');
      }
      setAdminToken(data.token);
      setIsAdmin(true);
      localStorage.setItem('thcs_math_admin_token', data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminToken(null);
    localStorage.removeItem('thcs_math_admin_token');
  };

  // AI draft autofill
  const handleAiDraft = async () => {
    if (!title.trim()) {
      setAiError('Vui lòng nhập "Tên chủ đề Toán học" trước để Gia sư AI định hướng thiết kế giáo án.');
      return;
    }
    setAiError(null);
    setAiGenerating(true);
    setAiSuccess(false);

    try {
      const res = await fetch('/api/math/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, grade, category })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI soạn giáo án thất bại.');
      }

      const generated = data.topic;
      setDescription(generated.description || '');
      setDifficulty(generated.difficulty || 'medium');
      if (generated.theory) {
        setTheoryIntro(generated.theory.introduction || '');
        setKeyPoints(generated.theory.keyPoints || ['']);
        setFormulas(generated.theory.formulas || [{ title: '', latex: '', explanation: '' }]);
        setExamples(generated.theory.examples || [{ question: '', solution: '', steps: [''] }]);
      }
      if (generated.exercises) {
        setExercises(generated.exercises);
      }
      setAiSuccess(true);
    } catch (err: any) {
      setAiError(err.message || 'Lỗi bất ngờ xảy ra khi sinh giáo trình tự động.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Dynamic Array helpers
  const handleAddKeypoint = () => setKeyPoints([...keyPoints, '']);
  const handleRemoveKeypoint = (idx: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== idx));
  };
  const handleKeypointChange = (idx: number, val: string) => {
    const updated = [...keyPoints];
    updated[idx] = val;
    setKeyPoints(updated);
  };

  const handleAddFormula = () => setFormulas([...formulas, { title: '', latex: '', explanation: '' }]);
  const handleRemoveFormula = (idx: number) => setFormulas(formulas.filter((_, i) => i !== idx));
  const handleFormulaChange = (idx: number, field: 'title' | 'latex' | 'explanation', val: string) => {
    const updated = [...formulas];
    updated[idx][field] = val;
    setFormulas(updated);
  };

  const handleAddExample = () => setExamples([...examples, { question: '', solution: '', steps: [''] }]);
  const handleRemoveExample = (idx: number) => setExamples(examples.filter((_, i) => i !== idx));
  const handleExampleChange = (idx: number, field: 'question' | 'solution', val: string) => {
    const updated = [...examples];
    updated[idx][field] = val;
    setExamples(updated);
  };
  const handleExampleStepChange = (exIdx: number, stepIdx: number, val: string) => {
    const updated = [...examples];
    updated[exIdx].steps[stepIdx] = val;
    setExamples(updated);
  };
  const handleAddExampleStep = (exIdx: number) => {
    const updated = [...examples];
    updated[exIdx].steps.push('');
    setExamples(updated);
  };
  const handleRemoveExampleStep = (exIdx: number, stepIdx: number) => {
    const updated = [...examples];
    updated[exIdx].steps = updated[exIdx].steps.filter((_, i) => i !== stepIdx);
    setExamples(updated);
  };

  // Exercise handlers
  const handleAddExercise = (type: 'multiple-choice' | 'text') => {
    const newEx: Exercise = {
      id: 'ex-' + Date.now() + '-' + exercises.length,
      question: '',
      type,
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: '',
      stepByStep: ['']
    };
    setExercises([...exercises, newEx]);
  };
  const handleRemoveExercise = (idx: number) => setExercises(exercises.filter((_, i) => i !== idx));
  const handleExerciseChange = (idx: number, field: 'question' | 'correctAnswer', val: string) => {
    const updated = [...exercises];
    updated[idx] = { ...updated[idx], [field]: val };
    setExercises(updated);
  };
  const handleExerciseOptionChange = (exIdx: number, optIdx: number, val: string) => {
    const updated = [...exercises];
    if (updated[exIdx].options) {
      updated[exIdx].options![optIdx] = val;
      setExercises(updated);
    }
  };
  const handleExerciseStepChange = (exIdx: number, stepIdx: number, val: string) => {
    const updated = [...exercises];
    updated[exIdx].stepByStep[stepIdx] = val;
    setExercises(updated);
  };
  const handleAddExerciseStep = (exIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].stepByStep.push('');
    setExercises(updated);
  };
  const handleRemoveExerciseStep = (exIdx: number, stepIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].stepByStep = updated[exIdx].stepByStep.filter((_, i) => i !== stepIdx);
    setExercises(updated);
  };

  // Submit the new topic
  const handleSubmitTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !theoryIntro.trim()) {
      alert('Vui lòng chuẩn bị các thông tin cốt lõi (Tiêu đề, Mô tả, Giới thiệu lý thuyết).');
      return;
    }

    const filteredKeypoints = keyPoints.filter(k => k.trim().length > 0);
    const filteredFormulas = formulas.filter(f => f.title.trim() && f.latex.trim());
    const filteredExamples = examples.filter(ex => ex.question.trim() && ex.solution.trim());
    const filteredExercises = exercises.filter(ex => ex.question.trim() && ex.correctAnswer.trim());

    if (filteredExercises.length === 0) {
      alert('Sách giáo trình cần có ít nhất một bài tập thực hành rèn luyện cho học sinh.');
      return;
    }

    const compiledTopic: MathTopic = {
      id: 'custom-topic-' + Date.now(),
      grade,
      category,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      theory: {
        introduction: theoryIntro.trim(),
        keyPoints: filteredKeypoints.length > 0 ? filteredKeypoints : ['Ghi nhớ kiến thức sách giáo khoa'],
        formulas: filteredFormulas,
        examples: filteredExamples
      },
      exercises: filteredExercises
    };

    try {
      const res = await fetch('/api/math/custom-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: compiledTopic, token: adminToken })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không đẩy được chủ đề mới lên máy chủ.');
      }
      
      onAddTopic(data.topic);
      alert('Đã lưu và xuất bản chủ đề mới thành công rực rỡ!');
      onClose();

      // Reset form fields
      setTitle('');
      setDescription('');
      setTheoryIntro('');
      setKeyPoints(['']);
      setFormulas([{ title: '', latex: '', explanation: '' }]);
      setExamples([{ question: '', solution: '', steps: [''] }]);
      setExercises([
        { id: 'ex-1', question: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '', stepByStep: [''] },
        { id: 'ex-2', question: '', type: 'text', correctAnswer: '', stepByStep: [''] }
      ]);
    } catch (err: any) {
      alert(err.message || 'Xảy ra sự cố khi thêm giáo án lên hệ thống cơ sở dữ liệu.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-left select-text">
        
        {/* Background gradient effects */}
        <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 -translate-x-20 translate-y-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                Hệ thống Quản lý và Biên soạn Chủ đề Giáo dục
              </h2>
              <p className="text-[11px] text-slate-400">Xem, chỉnh sửa, thêm mới lý thuyết & bài tập chuẩn KaTeX</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 overflow-y-auto p-6 z-10 space-y-6">
          
          {/* LOGIN FLOW (Visible only if unauthorized) */}
          {!isAdmin ? (
            <div className="max-w-md mx-auto py-10 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-4 bg-indigo-950/40 rounded-full border border-indigo-500/30 text-indigo-400 mb-2">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Đăng nhập tài khoản Ban giáo viên Admin</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Vui lòng đăng nhập bằng thông tin ban tổ chức để bổ sung giáo án toán tự chọn.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tài khoản</label>
                  <input
                    type="text"
                    value={username}
                    placeholder="Nhập tài khoản (Mặc định: admin)"
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mật khẩu</label>
                  <input
                    type="password"
                    value={password}
                    placeholder="Nhập mật khẩu (Mặc định: admin123)"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {loginError && (
                  <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/35 p-3 rounded-xl">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  {loginLoading ? (
                    'Độc giả Admin đang đăng nhập...'
                  ) : (
                    <>
                      <span>Mở khóa Quyền Giáo viên</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="p-4 bg-slate-850/60 rounded-xl border border-slate-800 flex gap-3 text-xs text-slate-400">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Thông tin trải nghiệm nhanh:</p>
                  <p className="mt-1">Để kiểm tra tính năng nhanh, hãy nhập:</p>
                  <p className="mt-1 text-slate-200"><strong>Tài khoản:</strong> admin</p>
                  <p className="text-slate-200"><strong>Mật khẩu:</strong> admin123</p>
                </div>
              </div>
            </div>
          ) : (
            
            /* AUTHORIZED ADMIN INTERFACE (FORM WRAPPER) */
            <form onSubmit={handleSubmitTopic} className="space-y-6">
              
              {/* Top Banner Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-slate-300">
                    Đăng nhập dưới tư cách: <strong className="text-emerald-400">Ban quản trị Giáo viên (Admin)</strong>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                      showPreview 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {showPreview ? 'Đóng góc xem thử' : 'Bật xem thử LaTeX'}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-red-950/35 hover:bg-red-950/60 border border-red-900/40 text-red-300 hover:text-red-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>

              {/* SECTION: GENERAL METADATA & AI COMPILER */}
              <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-400 flex items-center gap-1.5">
                    <BookOpen className="w-4.5 h-4.5" />
                    Bước 1: Khai báo lớp học & Thiết kế Khung Đề mục
                  </span>
                </div>

                {/* AI-Assisted Generator Magic Bar */}
                <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/30 border border-indigo-900/40 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Công nghệ sinh giáo án thông minh qua AI
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-lg">
                      Hãy nhập <strong>Tên chủ đề Toán</strong> bên dưới rồi chọn Lớp/Phân môn. Sau đó bấm nút này để AI tự động soạn thảo lý thuyết mẫu, công thức KaTeX và 2 bài tập rèn luyện cho bạn trong 5 giây!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAiDraft}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-850 disabled:text-slate-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
                    {aiGenerating ? 'AI Đang thiết kế...' : 'Gọi Trợ lý AI Soạn nhanh ⚡'}
                  </button>
                </div>

                {aiError && (
                  <div className="text-xs text-red-400 bg-red-950/20 border border-red-950/40 p-3 rounded-xl">
                    {aiError}
                  </div>
                )}

                {aiSuccess && (
                  <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-950/40 p-3 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Bộ khung giáo án đã được nạp đầy đủ! Bạn có thể xem thử LaTeX, điều chỉnh các câu chữ dưới dạng biểu thức và nhấn Thêm chủ đề.</span>
                  </div>
                )}

                {/* Title & Grade inputs */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Topic Title */}
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tên chủ đề Toán học</label>
                    <input
                      type="text"
                      required
                      value={title}
                      placeholder="Ví dụ: Định lý Thales trong tam giác, Giải bài toán bằng cách lập hệ..."
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                    />
                  </div>

                  {/* Grade Selection */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Khối học</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as Grade)}
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="6">Lớp 6</option>
                      <option value="7">Lớp 7</option>
                      <option value="8">Lớp 8</option>
                      <option value="9">Lớp 9</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phân môn</label>
                    <div className="flex gap-2">
                      <label className={`flex-1 text-center py-2 border rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        category === 'algebra' 
                          ? 'bg-emerald-600/10 border-emerald-550 text-emerald-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350'
                      }`}>
                        <input
                          type="radio"
                          name="form-category"
                          checked={category === 'algebra'}
                          onChange={() => setCategory('algebra')}
                          className="sr-only"
                        />
                        Đại số
                      </label>
                      <label className={`flex-1 text-center py-2 border rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        category === 'geometry' 
                          ? 'bg-indigo-600/10 border-indigo-550 text-indigo-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350'
                      }`}>
                        <input
                          type="radio"
                          name="form-category"
                          checked={category === 'geometry'}
                          onChange={() => setCategory('geometry')}
                          className="sr-only"
                        />
                        Hình học
                      </label>
                    </div>
                  </div>

                </div>

                {/* Description & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Topic Description */}
                  <div className="md:col-span-9 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mô tả ngắn về chủ đề</label>
                    <input
                      type="text"
                      required
                      value={description}
                      placeholder="Một câu mô tả bài học kích thích hứng thú, giúp nắm được trọng điểm bài học..."
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Difficulty Selection */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cấp độ tiếp cận</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="easy">Nhận biết (Dễ)</option>
                      <option value="medium">Thông hiểu (Khá)</option>
                      <option value="hard">Vận dụng (Khó)</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* SECTION: THEORY SECTION DETAILS */}
              <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl p-5 space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-400">
                    📚 Bước 2: Biên soạn Lý Thuyết &amp; Công Thức Trọng Tâm mẫu
                  </span>
                </div>

                {/* Theory Introduction */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Khái quát bài giảng bài học</label>
                  <textarea
                    required
                    rows={2}
                    value={theoryIntro}
                    placeholder="Giới thiệu sâu xa về ý học khoa học, gốc rễ lịch sử hoặc định nghĩa ban đầu của chủ đề..."
                    onChange={(e) => setTheoryIntro(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                  {showPreview && theoryIntro && (
                    <div className="mt-1.5 p-2 bg-slate-950 rounded-lg border border-indigo-900/30 text-xs">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase">Xem thử:</span>
                      <p className="mt-0.5 text-slate-300"><MathRenderer text={theoryIntro} /></p>
                    </div>
                  )}
                </div>

                {/* Dynamic Key Points to memorize */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">✍️ Khóa kiến thức trọng tâm (Cần nhớ)</label>
                    <button
                      type="button"
                      onClick={handleAddKeypoint}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Thêm dòng ghi nhớ
                    </button>
                  </div>

                  <div className="space-y-2">
                    {keyPoints.map((point, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-slate-500 w-5 text-right font-mono">{index + 1}.</span>
                        <input
                          type="text"
                          value={point}
                          placeholder={`Kiến thức cốt lõi thứ ${index + 1}...`}
                          onChange={(e) => handleKeypointChange(index, e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                        {keyPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKeypoint(index)}
                            className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-850 hover:border-slate-750 text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Formulas list */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between border-t border-slate-850 pt-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">📐 Công thức toán học (Định lý / Đẳng thức)</label>
                    <button
                      type="button"
                      onClick={handleAddFormula}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Thêm công thức mới
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {formulas.map((form, index) => (
                      <div key={index} className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 space-y-3.5 relative">
                        {formulas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFormula(index)}
                            className="absolute top-2 right-2 p-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-red-400 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-4 space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">Tên công thức / Quy tắc</span>
                            <input
                              type="text"
                              value={form.title}
                              placeholder="Ví dụ: Công thức tính nhanh"
                              onChange={(e) => handleFormulaChange(index, 'title', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-650"
                            />
                          </div>

                          <div className="md:col-span-4 space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">Định dạng mã LaTeX</span>
                            <input
                              type="text"
                              value={form.latex}
                              placeholder="Ví dụ: a^2 + b^2 = c^2"
                              onChange={(e) => handleFormulaChange(index, 'latex', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-indigo-300 placeholder-indigo-950"
                            />
                          </div>

                          <div className="md:col-span-4 space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">Ý nghĩa chi tiết</span>
                            <input
                              type="text"
                              value={form.explanation}
                              placeholder="Ví dụ: các cạnh góc vuông"
                              onChange={(e) => handleFormulaChange(index, 'explanation', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-650"
                            />
                          </div>
                        </div>

                        {/* LaTeX Formula preview */}
                        {showPreview && form.latex && (
                          <div className="py-2.5 px-3 bg-slate-950 border border-indigo-950 rounded-lg text-center mt-1 text-xs">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase block text-left mb-1">Xem trước công thức kỹ thuật:</span>
                            <MathRenderer text={form.latex} block />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examples Section */}
                <div className="space-y-4 pt-2 border-t border-slate-850">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">💡 Các ví dụ điển hình (Có lời giải mẫu)</label>
                    <button
                      type="button"
                      onClick={handleAddExample}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Thêm ví dụ mẫu
                    </button>
                  </div>

                  <div className="space-y-4">
                    {examples.map((ex, exIdx) => (
                      <div key={exIdx} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3.5 relative">
                        {examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExample(exIdx)}
                            className="absolute top-2 right-2 p-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-red-400 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        <span className="text-xs font-bold text-indigo-300 block">Ví dụ {exIdx + 1}</span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">Đề bài ví dụ</span>
                            <textarea
                              rows={2}
                              value={ex.question}
                              placeholder="Nhập đề bài, có thể chứa toán học như $x^2 = 4$..."
                              onChange={(e) => handleExampleChange(exIdx, 'question', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-650 resize-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">Phương pháp cốt lõi</span>
                            <textarea
                              rows={2}
                              value={ex.solution}
                              placeholder="Trình bày hướng hoặc cách phân giải chính..."
                              onChange={(e) => handleExampleChange(exIdx, 'solution', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-650 resize-none"
                            />
                          </div>
                        </div>

                        {/* Steps of solution */}
                        <div className="space-y-2 pt-2 border-t border-slate-900 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase">Trình tự giải chi tiết từng bước</span>
                            <button
                              type="button"
                              onClick={() => handleAddExampleStep(exIdx)}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                            >
                              + Thêm bước làm
                            </button>
                          </div>

                          <div className="space-y-2">
                            {ex.steps.map((step, stepIdx) => (
                              <div key={stepIdx} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 shrink-0">B{stepIdx + 1}:</span>
                                <input
                                  type="text"
                                  value={step}
                                  placeholder={`Tìm tập xác định, thực hiện tính toán...`}
                                  onChange={(e) => handleExampleStepChange(exIdx, stepIdx, e.target.value)}
                                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                                />
                                {ex.steps.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExampleStep(exIdx, stepIdx)}
                                    className="p-1 hover:bg-slate-800 text-red-400 rounded-lg cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Examples renders preview */}
                        {showPreview && (ex.question || ex.solution) && (
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-xs">
                            <span className="text-[9px] text-indigo-300 font-bold block">Xem thử Ví dụ {exIdx + 1}:</span>
                            <p className="text-slate-200"><strong>Đề bài:</strong> <MathRenderer text={ex.question} /></p>
                            <p className="text-slate-350 italic">Phương pháp: <MathRenderer text={ex.solution} /></p>
                            <div className="pl-2 border-l border-indigo-700 space-y-1 mt-1 text-slate-400">
                              {ex.steps.map((st, i) => st && <div key={i}><MathRenderer text={st} /></div>)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* SECTION: PRACTICE EXERCISES PRACTICE */}
              <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl p-5 space-y-5">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-400">
                    📐 Bước 3: Biên tập Hệ thống Bài Tập Rèn Luyện thực nghiệm
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddExercise('multiple-choice')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      + Trắc nghiệm (4 tùy chọn)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddExercise('text')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      + Điền số ngắn
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {exercises.map((ex, exIdx) => (
                    <div key={ex.id || exIdx} className="bg-slate-950/55 border border-slate-850 p-4 rounded-2xl space-y-4 relative">
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exIdx)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-red-400 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold bg-indigo-500/10 border border-indigo-950 px-2 py-0.5 rounded text-indigo-400">
                          Câu {exIdx + 1}
                        </span>
                        <span className="text-[10px] lowercase text-slate-500 italic">
                          ({ex.type === 'multiple-choice' ? 'Trắc nghiệm tự chọn' : 'Tự điền đáp số ngắn'})
                        </span>
                      </div>

                      {/* Question Content */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Câu hỏi toán học</span>
                        <textarea
                          rows={2}
                          required
                          value={ex.question}
                          placeholder="Điền nội dung đề bài (ví dụ: Tìm x biết $2x - 3 = 5$...)"
                          onChange={(e) => handleExerciseChange(exIdx, 'question', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-650 resize-none focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Options or Answer Input */}
                      {ex.type === 'multiple-choice' ? (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Khai báo 4 tùy chọn đáp án</span>
                          <div className="grid grid-cols-2 gap-2">
                            {[0, 1, 2, 3].map((optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2 bg-slate-900 px-3 py-1 bg-slate-900 rounded-xl border border-slate-800">
                                <span className="text-xs font-bold text-slate-500">{String.fromCharCode(65 + optIdx)}.</span>
                                <input
                                  type="text"
                                  required
                                  value={ex.options?.[optIdx] || ''}
                                  placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                                  onChange={(e) => handleExerciseOptionChange(exIdx, optIdx, e.target.value)}
                                  className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder-slate-650"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Correct Answer */}
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Đáp số chính thức</span>
                        <input
                          type="text"
                          required
                          value={ex.correctAnswer}
                          placeholder={ex.type === 'multiple-choice' ? 'Điền chính xác đáp án đúng (ví dụ: gõ hệt đáp án A để hệ thống tự lọc)' : 'Ví dụ: 3/4 hoặc 5...'}
                          onChange={(e) => handleExerciseChange(exIdx, 'correctAnswer', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-505"
                        />
                      </div>

                      {/* Step By Step Guide */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-900">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Sách lời giải từng bước cho học sinh tra cứu</span>
                          <button
                            type="button"
                            onClick={() => handleAddExerciseStep(exIdx)}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                          >
                            + Thêm bước giải
                          </button>
                        </div>

                        <div className="space-y-2">
                          {ex.stepByStep.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 font-mono">B{sIdx + 1}:</span>
                              <input
                                type="text"
                                value={step}
                                placeholder="Cách biến đổi, suy luận từng dòng hỗ trợ LaTeX..."
                                onChange={(e) => handleExerciseStepChange(exIdx, sIdx, e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                              />
                              {ex.stepByStep.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExerciseStep(exIdx, sIdx)}
                                  className="p-1 hover:bg-slate-800 text-red-400 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Show preview */}
                      {showPreview && ex.question && (
                        <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-xs">
                          <span className="text-[9px] text-indigo-400 font-bold block">Xem thử câu hỏi số {exIdx + 1}:</span>
                          <p className="text-slate-200 font-medium"><MathRenderer text={ex.question} /></p>
                          {ex.type === 'multiple-choice' && ex.options && (
                            <div className="grid grid-cols-2 gap-2 mt-1 text-slate-400">
                              {ex.options.map((opt, i) => opt && <div key={i}>{String.fromCharCode(65+i)}. <MathRenderer text={opt} /></div>)}
                            </div>
                          )}
                          <p className="text-emerald-400 text-[11px] mt-1">✔ Đáp án đúng: <MathRenderer text={ex.correctAnswer} /></p>
                          <div className="pl-2 border-l border-indigo-700 text-slate-500 space-y-1 mt-1 text-[11px]">
                            {ex.stepByStep.map((st, i) => st && <div key={i}><MathRenderer text={st} /></div>)}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>

              {/* ACTION FOOTER */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 z-10 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-350 hover:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer animate-fade-in-quick"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Thêm &amp; Kích hoạt Chủ đề dạy học THCS
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
