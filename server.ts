import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy load Gemini client to prevent crash if key is missing on start
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Bạn cần thiết lập GEMINI_API_KEY trong mục Settings > Secrets để kích hoạt Gia sư AI.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// 1. API: Kiểm tra trạng thái và sự tồn tại của API Key
app.get('/api/math/status', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({
    hasKey,
    message: hasKey 
      ? 'Gia Sư AI sẵn sàng!' 
      : 'Vui lòng thêm GEMINI_API_KEY trong cấu hình Secrets để sử dụng Gia sư AI tối ưu.',
  });
});

// 2. API: Trả lời giải thích chi tiết từng bước cho bài toán tự nhập
app.post('/api/math/explain-step', async (req: express.Request, res: express.Response) => {
  try {
    const { query, topic, grade } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Nội dung câu hỏi không được trống.' });
      return;
    }

    const ai = getGemini();
    const systemPrompt = `Bạn là một Gia sư Toán học cấp Trung học Cơ sở (lớp 6, 7, 8, 9) tại Việt Nam, cực kỳ kiên nhẫn, tận tâm và am hiểu sư phạm toán. 
Học sinh cần bạn hướng dẫn chi tiết một bài toán học hoặc một thắc mắc lý thuyết toán học.
Khóa học hoặc bối cảnh hiện tại:
- Lớp học: Lớp ${grade || 'THCS đại trà'}
- Chủ đề: ${topic || 'Toán học tổng quát'}

Hãy thực hiện giải thích theo cấu trúc sau:
1. **Phân tích đề bài**: Tóm tắt giả thiết và kết luận của bài toán, định hướng suy nghĩ bằng ngôn từ dễ hiểu, gần gũi.
2. **Kiến thức cốt lõi sử dụng**: Chỉ ra các công thức quan trọng, định lí, hằng đẳng thức cần áp dụng.
3. **Các bước giải chi tiết**: Trình bày từng bước một cách khoa học rõ ràng (Sử dụng danh sách số thứ tự 1., 2., 3.,...). Giải thích tại sao lại làm bước đó.
4. **Mẹo ghi nhớ hoặc lưu ý tránh sai sót**: Đưa ra lời khuyên thiết thực giúp học sinh nhớ lâu phương pháp này.

Hãy trình bày bằng Markdown thân thiện, sử dụng chữ in đậm, chữ nghiêng, danh sách gạch đầu dòng, dấu công thức dễ đọc, không viết tắt khó hiểu. Trả lời bằng tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error('Lỗi khi gọi Gemini API:', error);
    res.status(500).json({ 
      error: error.message || 'Đã xảy ra lỗi hệ thống khi liên kết với AI.',
      isConfigError: error.message?.includes('GEMINI_API_KEY')
    });
  }
});

// 3. API: Tạo thêm bài tập thực hành sinh động tùy biến theo chủ đề (Infinite Practice Generator)
app.post('/api/math/generate-exercise', async (req: express.Request, res: express.Response) => {
  try {
    const { topicId, topicTitle, topicDescription, grade, category, difficulty } = req.body;
    if (!topicTitle) {
      res.status(400).json({ error: 'Thiếu thông tin chủ đề toán.' });
      return;
    }

    // Determine instructional text for difficulty
    let difficultyInstruction = '';
    const diffLower = (difficulty || '').toLowerCase();
    if (diffLower === 'dễ' || diffLower === 'easy') {
      difficultyInstruction = 'Mức độ: DỄ. Các câu hỏi ở mức độ Nhận biết, thông hiểu, tính toán cơ bản và trực diện áp dụng công thức, giúp học sinh nắm vững lý thuyết cốt lõi.';
    } else if (diffLower === 'trung bình' || diffLower === 'medium') {
      difficultyInstruction = 'Mức độ: TRUNG BÌNH. Các câu hỏi ở mức độ Thông hiểu và Vận dụng thấp, có tính toán từ 1-2 bước, cần suy nghĩ logic nhẹ nhàng.';
    } else if (diffLower === 'khá' || diffLower === 'advanced') {
      difficultyInstruction = 'Mức độ: KHÁ. Các câu hỏi ở mức độ Vận dụng, yêu cầu học sinh kết nối các kiến thức, phân tích bài toán trung bình và áp dụng linh hoạt phương pháp giải.';
    } else if (diffLower === 'khó' || diffLower === 'hard') {
      difficultyInstruction = 'Mức độ: KHÓ / VẬN DỤNG CAO. Các câu hỏi cực kỳ thử thách, đòi hỏi tư duy sâu sắc, kỹ năng biến đổi tốt dành cho học sinh khá giỏi hoặc ôn thi học sinh giỏi.';
    } else {
      difficultyInstruction = 'Mức độ: Phù hợp với năng lực trung bình khá của học sinh.';
    }

    const ai = getGemini();
    const prompt = `Hãy tạo 2 bài tập toán đầy thách thức và bổ ích phù hợp cho học sinh lớp ${grade}, chủ đề "${topicTitle}" (${category === 'algebra' ? 'Đại số' : 'Hình học'}) có mô tả: "${topicDescription}".

YÊU CẦU ĐẶC BIỆT VỀ ĐỘ KHÓ: ${difficultyInstruction}

Yêu cầu định dạng:
- 1 bài tập trắc nghiệm khách quan (multiple-choice) có 4 đáp án lựa chọn khác nhau, có định dạng rõ ràng, một đáp án là chính xác.
- 1 bài tập tự luận hoặc điền số (text), đáp án chính xác là một từ hoặc một con số ngắn gọn.
- Cả hai câu hỏi cần có giải thích chi tiết từng bước bằng tiếng Việt và phù hợp với trình độ học sinh trung học cơ sở Việt Nam.

QUY TẮC LATEX (QUAN TRỌNG):
- Mọi công thức Toán học, biểu thức, phương trình, phân số (ví dụ: \\frac{a}{b}), căn thức (\\sqrt{x}), chữ số mũ (x^2), ký hiệu hình học, biến số đơn lẻ (x, y, a, b, A, B) xuất hiện trong đề bài ("question"), các lựa chọn trắc nghiệm ("options"), đáp án ("correctAnswer") và các bước giải ("stepByStep") BẮT BUỘC phải được đặt trong cặp ký tự đô-la để hiển thị công thức đẹp mắt.
- Sử dụng $...$ cho công thức nội dòng (inline, ví dụ: $x = 2$, $\\frac{1}{2}$) và $$...$$ cho những phương trình phức tạp, lớn đứng riêng một dòng (block).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `Bạn là trợ lý toán cấp THCS hàng đầu Việt Nam. Có nhiệm vụ xuất ra định dạng JSON cấu trúc bài tập toán chính xác. Toàn bộ công thức toán, phân số, biến số, căn thức bắt buộc viết bằng LaTeX chuẩn và bọc trong cặp dấu $...$ hoặc $$...$$. Cấm không bọc dấu đô-la khi dùng lệnh LaTeX.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'Danh sách bài tập toán vừa tạo',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'ID ngẫu nhiên duy nhất cho bài viết, ví dụ: gen-ex-1' },
              question: { type: Type.STRING, description: 'Đề bài toán bằng tiếng Việt rõ ràng, kèm giả thiết đầy đủ.' },
              type: { type: Type.STRING, description: 'Phân loại bài: "multiple-choice" hoặc "text"' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4 lựa chọn cho bài trắc nghiệm (bắt buộc nếu type là multiple-choice, để rỗng nếu là text)'
              },
              correctAnswer: { type: Type.STRING, description: 'Đáp án đúng chính xác (phải khớp hoàn toàn với một trong các lựa chọn nếu là trắc nghiệm)' },
              stepByStep: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Các bước hướng dẫn chi tiết từng bước, mỗi phần tử là 1 bước rõ ràng.'
              }
            },
            required: ['id', 'question', 'type', 'correctAnswer', 'stepByStep']
          }
        },
        temperature: 0.7,
      },
    });

    const exercises = JSON.parse(response.text || '[]');
    res.json({ exercises });
  } catch (error: any) {
    console.error('Lỗi khi tạo bài tập qua Gemini:', error);
    res.status(500).json({ 
      error: error.message || 'Không thể tạo mới bài học qua AI.',
      isConfigError: error.message?.includes('GEMINI_API_KEY')
    });
  }
});

// 4. API: Interactive Chat với Gia sư AI (Chatbot ôn bài)
app.post('/api/math/chat-tutor', async (req: express.Request, res: express.Response) => {
  try {
    const { messages, topicTitle, grade } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Không tìm thấy lịch sử tin nhắn hợp lệ.' });
      return;
    }

    const ai = getGemini();
    const systemPrompt = `Bạn là một gia sư toán học AI tên là "MathJunior" thân thiện và thông minh.
Nhiệm vụ của bạn là hỗ trợ nâng cao kết quả học Toán của các học sinh Trung học Cơ sở (lớp 6 - lớp 9) tại Việt Nam.
Bối cảnh học sinh hiện tại: Đang học lớp ${grade || 'THCS'}, ôn tập chủ đề: "${topicTitle || 'Toán học thường thức'}".

Nguyên tắc giải đáp của bạn:
1. Luôn động viên bằng thái độ ấm áp, khích lệ nỗ lực tự suy nghĩ.
2. KHÔNG giải hộ ngay lập tức từ đầu đến cuối một cách máy móc. Hãy đặt câu hỏi gợi mở, hướng dẫn từng bước nhỏ để kích thích tư duy phát triển của học sinh.
3. Giải thích ngắn gọn lý do áp dụng công thức, chỉ ra lỗi sai phổ biến học sinh hay mắc.
4. Sử dụng từ ngữ thân thiện (ví dụ xưng hô em - thầy/cô hoặc em - tớ để gần gũi).
5. Trả lời bằng tiếng Việt, có thể sử dụng biểu tượng cảm xúc Toán học. Gõ công thức Toán rõ nét trên các dòng riêng biệt.`;

    // Map client chat history to Gemini formats
    // We can translate messages to contents format
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Lỗi gia sư AI chat:', error);
    res.status(500).json({ 
      error: error.message || 'Gia sư AI bận đột xuất.',
      isConfigError: error.message?.includes('GEMINI_API_KEY')
    });
  }
});

// 5. API: Store custom topics in server memory
const customTopics: any[] = [];

// API: Admin Login
app.post('/api/math/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'admin-master-token-2026' });
  } else {
    res.status(401).json({ error: 'Tài khoản hoặc mật khẩu admin không chính xác.' });
  }
});

// API: Lấy danh sách toàn bộ chủ đề bổ sung
app.get('/api/math/custom-topics', (req, res) => {
  res.json({ customTopics });
});

// API: Tạo mới một chủ đề tự chọn
app.post('/api/math/custom-topics', (req, res) => {
  const { topic, token } = req.body;
  if (token !== 'admin-master-token-2026') {
    res.status(403).json({ error: 'Quyền truy cập bị từ chối. Vui lòng đăng nhập Admin.' });
    return;
  }
  if (!topic || !topic.title || !topic.grade || !topic.category) {
    res.status(400).json({ error: 'Thông tin chủ đề không hợp lệ.' });
    return;
  }

  // Generate dynamic id
  const topicId = 'custom-topic-' + Date.now();
  const newTopic = {
    ...topic,
    id: topicId,
    exercises: (topic.exercises || []).map((ex: any, idx: number) => ({
      ...ex,
      id: ex.id || `custom-ex-${topicId}-${idx}-${Date.now()}`
    }))
  };

  customTopics.push(newTopic);
  res.json({ success: true, topic: newTopic });
});

// API: Xóa một chủ đề tự chọn
app.delete('/api/math/custom-topics/:id', (req, res) => {
  const { id } = req.params;
  const token = req.query.token || req.headers.authorization || req.body.token;

  if (token !== 'admin-master-token-2026') {
    res.status(403).json({ error: 'Quyền truy cập bị từ chối. Vui lòng đăng nhập Admin.' });
    return;
  }

  const index = customTopics.findIndex(t => t.id === id);
  if (index !== -1) {
    customTopics.splice(index, 1);
    res.json({ success: true, message: 'Đã xóa chủ đề bổ sung thành công.' });
  } else {
    res.status(404).json({ error: 'Không tìm thấy chủ đề hoặc đây là chủ đề mẫu không thể xóa.' });
  }
});

// API: Cập nhật một chủ đề tự chọn
app.put('/api/math/custom-topics/:id', (req, res) => {
  const { id } = req.params;
  const { topic, token } = req.body;

  if (token !== 'admin-master-token-2026') {
    res.status(403).json({ error: 'Quyền truy cập bị từ chối. Vui lòng đăng nhập Admin.' });
    return;
  }

  const index = customTopics.findIndex(t => t.id === id);
  if (index !== -1) {
    customTopics[index] = {
      ...customTopics[index],
      ...topic,
      id
    };
    res.json({ success: true, topic: customTopics[index] });
  } else {
    // If not found, add it
    const newTopic = {
      ...topic,
      id
    };
    customTopics.push(newTopic);
    res.json({ success: true, topic: newTopic });
  }
});

// API: Soạn giáo án tự động bằng AI (AI Topic Draft Generator)
app.post('/api/math/generate-topic', async (req: express.Request, res: express.Response) => {
  try {
    const { title, grade, category } = req.body;
    if (!title || !grade || !category) {
      res.status(400).json({ error: 'Vui lòng điền đủ Tiêu đề, Lớp và Phân môn trước khi gọi AI.' });
      return;
    }

    const ai = getGemini();
    const prompt = `Hãy thiết kế một giáo án chủ đề học Toán THCS hoàn chỉnh cho chương trình Việt Nam.
Thông tin cơ bản:
- Tiêu đề chủ đề: "${title}"
- Lớp học: Lớp ${grade}
- Phân môn toán: ${category === 'algebra' ? 'Đại số' : 'Hình học'}

Yêu cầu xuất ra cấu trúc dữ liệu JSON chi tiết, chính xác và đầy đủ các trường sau (toàn bộ nội dung lý thuyết, công thức, ví dụ viết bằng tiếng Việt chân thực, sư phạm tốt, hỗ trợ mã LaTeX):
1. description (Mô tả ngắn gọn, súc tích về ý nghĩa thực tế hoặc lý do học sinh cần ôn tập chủ đề này).
2. difficulty (Độ khó chung: "easy", "medium", hoặc "hard").
3. theory (Phần lý thuyết trọng tâm):
   - introduction (Giới thiệu lý thuyết tổng quan súc tích, khêu gợi tư duy).
   - keyPoints (Một mảng gồm 3 đến 5 kiến thức cốt lõi cần thuộc lòng).
   - formulas (Một mảng gồm 2 đến 3 công thức, mỗi công thức là một đối tượng chứa: title (tên công thức), latex (mã LaTeX nguyên bản, không đặt trong dấu đô-la $, ví dụ "x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}"), explanation (ý nghĩa các ký tự trong công thức)).
   - examples (Một mảng gồm 2 ví dụ mẫu đã giải sẵn, mỗi ví dụ chứa: question (đề bài ví dụ), solution (phương pháp giải chính), steps (mảng các bước phân tích, tính toán hướng dẫn cụ thể từng bước)).
4. exercises (Một mảng gồm đúng 2 bài tập rèn luyện thực hành):
   - Bài 1 là trắc nghiệm khách quan (type: "multiple-choice"), chứa mảng options (gồm 4 lựa chọn đáp án dạng chuỗi) và correctAnswer (chuỗi kết quả đúng, phải khớp hoàn toàn với một trong các lựa chọn).
   - Bài 2 là tự luận điền số ngắn (type: "text"), correctAnswer là một từ hoặc con số kết quả cuối cùng.
   - Mỗi câu bài tập bắt buộc có mảng stepByStep liệt kê chi tiết từng phần giải chi tiết cách làm để học sinh đối chiếu khi nhấn "Xem lời giải".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `Bạn là Đại học sư phạm chuyên khoa biên soạn sách giáo khoa Toán học Trung học cơ sở Việt Nam. Hãy xuất ra cấu trúc JSON tối giản, chuẩn hóa, không chứa từ rác bên ngoài, bảo toàn cú pháp mã LaTeX nguyên chất.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          description: 'Cấu trúc giáo án môn toán học',
          properties: {
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            theory: {
              type: Type.OBJECT,
              properties: {
                introduction: { type: Type.STRING },
                keyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                formulas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      latex: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ['title', 'latex', 'explanation']
                  }
                },
                examples: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      solution: { type: Type.STRING },
                      steps: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ['question', 'solution', 'steps']
                  }
                }
              },
              required: ['introduction', 'keyPoints', 'formulas', 'examples']
            },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  stepByStep: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['id', 'question', 'type', 'correctAnswer', 'stepByStep']
                  }
                }
              },
          required: ['description', 'difficulty', 'theory', 'exercises']
        },
        temperature: 0.5,
      },
    });

    const parsedTopic = JSON.parse(response.text || '{}');
    parsedTopic.id = 'custom-topic-ai-' + Date.now();
    parsedTopic.title = title;
    parsedTopic.grade = grade;
    parsedTopic.category = category;

    res.json({ success: true, topic: parsedTopic });
  } catch (error: any) {
    console.error('Lỗi khi biên soạn chủ đề qua Gemini:', error);
    res.status(500).json({ error: error.message || 'Gặp lỗi trong quá trình tự động soạn thảo giáo án bằng trí tuệ nhân tạo.' });
  }
});

// Khởi chạy Vite Dev Server nếu không phải Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production build assets from static folder dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express fullstack server running on http://localhost:${PORT}`);
  });
}

startServer();
