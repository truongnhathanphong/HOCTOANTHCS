import { MathTopic } from '../types';

export const CURRICULUM: MathTopic[] = [
  // LỚP 6
  {
    id: 'lopsau-dai-so-phan-so',
    grade: '6',
    category: 'algebra',
    title: 'Phân số và Phép tính Phân số',
    description: 'Tìm hiểu khái niệm phân số, tính chất cơ bản của phân số và cách thực hiện các phép toán cộng, trừ, nhân, chia phân số.',
    difficulty: 'easy',
    theory: {
      introduction: 'Phân số là một cách biểu diễn một hoặc nhiều phần bằng nhau của một đơn vị. Phân số được viết dưới dạng a/b, trong đó a được gọi là tử số, b được gọi là mẫu số (b khác 0).',
      keyPoints: [
        'Tử số (a) biểu thị số phần bằng nhau được lấy ra.',
        'Mẫu số (b) biểu thị tổng số phần bằng nhau được chia ra.',
        'Hai phân số gọi là bằng nhau nếu chúng biểu diễn cùng một giá trị số. Quy tắc: a/b = c/d nếu a * d = b * c.',
        'Muốn cộng/trừ hai phân số không cùng mẫu, ta phải quy đồng mẫu số rồi cộng/trừ các tử số và giữ nguyên mẫu số chung.',
        'Muốn nhân hai phân số, ta nhân tử với tử, mẫu với mẫu.',
        'Muốn chia hai phân số, ta nhân phân số thứ nhất với phân số thứ hai đảo ngược.'
      ],
      formulas: [
        { title: 'Khái niệm phân số', latex: 'a/b  (with b ≠ 0)', explanation: 'a là tử số, b là mẫu số' },
        { title: 'Tính chất cơ bản', latex: '(a * m) / (b * m) = a/b', explanation: 'Khi nhân cả tử và mẫu với cùng một số m khác 0, ta được phân số bằng phân số ban đầu.' },
        { title: 'Phép cộng', latex: 'a/m + b/m = (a + b)/m', explanation: 'Cộng tử với tử khi có cùng mẫu số.' },
        { title: 'Phép nhân', latex: '(a/b) * (c/d) = (a * c)/(b * d)', explanation: 'Tử nhân tử, mẫu nhân mẫu.' },
        { title: 'Phép chia', latex: '(a/b) : (c/d) = (a/b) * (d/c) = (a * d)/(b * c)', explanation: 'Nhân đảo ngược phân số chia.' }
      ],
      examples: [
        {
          question: 'Tính: A = 2/3 + 1/4',
          solution: 'Thực hiện quy đồng mẫu số hai phân số về mẫu số chung là 12, sau đó cộng hai tử số với nhau.',
          steps: [
            'Bước 1: Tìm mẫu số chung nhỏ nhất của 3 và 4 là 12.',
            'Bước 2: Quy đồng 2/3 = (2 * 4) / (3 * 4) = 8/12.',
            'Bước 3: Quy đồng 1/4 = (1 * 3) / (4 * 3) = 3/12.',
            'Bước 4: Cộng tử số: 8/12 + 3/12 = (8 + 3)/12 = 11/12.',
            'Đáp số cuối cùng là 11/12 (đây đã là phân số tối giản).'
          ]
        },
        {
          question: 'Rút gọn phân số: B = 18/30',
          solution: 'Tìm ước chung lớn nhất của cả tử và mẫu rồi chia cả hai cho ước đó.',
          steps: [
            'Bước 1: Tìm các ước chung của 18 và 30. Ta thấy cả hai số cùng chia hết cho 2, 3, 6.',
            'Bước 2: Ước chung lớn nhất (ƯCLN) của 18 và 30 là 6.',
            'Bước 3: Chia cả tử và mẫu cho 6: 18 : 6 = 3 và 30 : 6 = 5.',
            'Bước 4: Kết quả phân số đã rút gọn tối giản là 3/5.'
          ]
        }
      ]
    },
    exercises: [
      {
        id: 'lopsau-ds-ps-ex1',
        question: 'Phép tính cộng 3/5 + 1/2 cho kết quả bằng bao nhiêu?',
        type: 'multiple-choice',
        options: ['4/7', '11/10', '4/10', '7/10'],
        correctAnswer: '11/10',
        stepByStep: [
          'Bước 1: Tìm mẫu số chung của 5 và 2, đó là 10.',
          'Bước 2: Quy đồng phân số thứ nhất: 3/5 = (3 * 2) / (5 * 2) = 6/10.',
          'Bước 3: Quy đồng phân số thứ hai: 1/2 = (1 * 5) / (2 * 5) = 5/10.',
          'Bước 4: Thực hiện phép cộng: 6/10 + 5/10 = (6 + 5)/10 = 11/10.',
          'Kết quả đúng là 11/10.'
        ]
      },
      {
        id: 'lopsau-ds-ps-ex2',
        question: 'Tính giá trị biểu thức sau và rút gọn tối giản: (4/9) * (3/8)',
        type: 'multiple-choice',
        options: ['12/72', '1/6', '7/17', '2/3'],
        correctAnswer: '1/6',
        stepByStep: [
          'Bước 1: Áp dụng quy tắc nhân phân số: Tử nhân tử, mẫu nhân mẫu.',
          'Bước 2: (4/9) * (3/8) = (4 * 3) / (9 * 8) = 12/72.',
          'Bước 3: Rút gọn phân số 12/72 bằng cách chia cả tử và mẫu cho ước chung lớn nhất của chúng.',
          'Bước 4: ƯCLN của 12 và 72 là 12. Thực hiện chia: 12 : 12 = 1, 72 : 12 = 6.',
          'Kết quả tối giản là 1/6.'
        ]
      },
      {
        id: 'lopsau-ds-ps-ex3',
        question: 'Điền số thích hợp vào dấu hỏi chấm: 2/7 = ?/21',
        type: 'text',
        correctAnswer: '6',
        stepByStep: [
          'Bước 1: Áp dụng quy tắc bằng nhau của phân số: a/b = c/d suy ra a * d = b * c.',
          'Bước 2: Có 2/7 = x/21 => 2 * 21 = 7 * x.',
          'Bước 3: Giải phương trình tìm x: 42 = 7 * x => x = 42 : 7 = 6.',
          'Hoặc nhanh hơn: Mẫu số tăng lên 3 lần (21 = 7 * 3), nên tử số cũng phải nhân với 3: 2 * 3 = 6.',
          'Số thích hợp là 6.'
        ]
      }
    ]
  },
  {
    id: 'lopsau-hinh-hoc-truc-quan',
    grade: '6',
    category: 'geometry',
    title: 'Hình học trực quan: Các hình phẳng đều',
    description: 'Học sinh nhận biết và hiểu các đặc điểm, công thức chu vi - diện tích cơ bản của hình tam giác đều, hình vuông, hình chữ nhật và lục giác đều.',
    difficulty: 'easy',
    theory: {
      introduction: 'Hình học trực quan giúp các em làm quen với các hình học cơ bản bao quanh chúng ta bằng cách quan sát, so sánh và thực nghiệm đo đạc thực tế.',
      keyPoints: [
        'Tam giác đều: Có 3 cạnh bằng nhau, 3 góc đỉnh bằng nhau và bằng 60 độ.',
        'Hình vuông: Có 4 cạnh bằng nhau, 4 góc vuông.',
        'Hình chữ nhật: Có 4 góc vuông, các cặp cạnh đối diện song song và bằng nhau.',
        'Hình thoi: Có 4 cạnh bằng nhau, các cặp cạnh đối diện song song, hai đường chéo vuông góc.'
      ],
      formulas: [
        { title: 'Diện tích hình chữ nhật', latex: 'S = a * b', explanation: 'a là chiều dài, b là chiều rộng' },
        { title: 'Chu vi hình vuông', latex: 'C = 4 * a', explanation: 'a là độ dài cạnh của hình vuông' },
        { title: 'Diện tích hình vuông', latex: 'S = a^2', explanation: 'a là độ dài cạnh của hình vuông' },
        { title: 'Diện tích hình thoi', latex: 'S = (1/2) * d1 * d2', explanation: 'd1, d2 lần lượt là độ dài hai đường chéo' }
      ],
      examples: [
        {
          question: 'Một mảnh vườn hình chữ nhật có chiều dài 15m, chiều rộng 8m. Hãy tính chu vi và diện tích mảnh vườn này.',
          solution: 'Áp dụng trực tiếp công thức tính chu vi và diện tích hình chữ nhật.',
          steps: [
            'Bước 1: Đoạn dữ liệu có chiều dài a = 15m, chiều rộng b = 8m.',
            'Bước 2: Chu vi mảnh vườn hình chữ nhật là: C = 2 * (a + b) = 2 * (15 + 8) = 2 * 23 = 46 (m).',
            'Bước 3: Diện tích mảnh vườn hình chữ nhật là: S = a * b = 15 * 8 = 120 (m²).',
            'Bước 4: Kết luận: Chu vi là 46m, diện tích vườn là 120m².'
          ]
        }
      ]
    },
    exercises: [
      {
        id: 'lopsau-hh-tq-ex1',
        question: 'Một hình vuông có diện tích là 64 m². Độ dài cạnh hình vuông này bằng bao nhiêu?',
        type: 'multiple-choice',
        options: ['4 m', '8 m', '16 m', '32 m'],
        correctAnswer: '8 m',
        stepByStep: [
          'Bước 1: Công thức diện tích hình vuông là S = a², với a là độ dài cạnh.',
          'Bước 2: Thay số: 64 = a².',
          'Bước 3: Tìm số dương mà bình phương bằng 64. Ta biết 8 * 8 = 64.',
          'Bước 4: Vậy độ dài cạnh hình vuông là 8 m.'
        ]
      }
    ]
  },

  // LỚP 7
  {
    id: 'loptay-dai-so-so-huu-ti',
    grade: '7',
    category: 'algebra',
    title: 'Số hữu tỉ và Các phép tính',
    description: 'Hiểu bản chất của số hữu tỉ, biểu diễn số hữu tỉ trên trục số, so sánh số hữu tỉ và rèn luyện các phép toán cộng, trừ, nhân, chia, lũy thừa trên Tập hợp Q.',
    difficulty: 'medium',
    theory: {
      introduction: 'Số hữu tỉ là số viết được dưới dạng phân số a/b với a, b thuộc tập số nguyên Z, và b khác 0. Tập hợp các số hữu tỉ được ký hiệu là Q.',
      keyPoints: [
        'Mọi số nguyên, số thập phân hữu hạn đều là số hữu tỉ vì đều viết được về dạng phân số.',
        'Khi thực hiện phép tính, ta đổi số hữu tỉ (như số thập phân, hỗn số) về dạng phân số tương đương.',
        'Thứ tự thực hiện phép tính giống như phép tính với số tự nhiên: ngoặc tròn trước, lũy thừa, rồi nhân chia, sau cùng là cộng trừ.'
      ],
      formulas: [
        { title: 'Định nghĩa số hữu tỉ', latex: 'Q = { a/b | a, b ∈ Z, b ≠ 0 }', explanation: 'Ký hiệu tập hợp số hữu tỉ' },
        { title: 'Phép lũy thừa phân số', latex: '(a/b)^n = a^n / b^n', explanation: 'Lũy thừa của một thương bằng thương các lũy thừa.' }
      ],
      examples: [
        {
          question: 'Tính giá trị biểu thức: C = 0.5 + (-1/3) * 1.5',
          solution: 'Chuyển đổi toàn bộ số thập phân về phân số để dễ thực hiện tính toán chính xác.',
          steps: [
            'Bước 1: Đổi số thập phân về phân số: 0.5 = 1/2 và 1.5 = 3/2.',
            'Bước 2: Viết lại biểu thức: C = 1/2 + (-1/3) * (3/2).',
            'Bước 3: Ưu tiên thực hiện phép nhân trước: (-1/3) * (3/2) = (-1 * 3) / (3 * 2) = -3/6 = -1/2.',
            'Bước 4: Thực hiện phép cộng: C = 1/2 + (-1/2) = 0.',
            'Kết quả cuối cùng thu được là 0.'
          ]
        }
      ]
    },
    exercises: [
      {
        id: 'loptay-ds-sht-ex1',
        question: 'Giá trị của biểu thức 1.25 - 1/4 bằng bao nhiêu?',
        type: 'multiple-choice',
        options: ['1', '0.5', '1.5', '1.2'],
        correctAnswer: '1',
        stepByStep: [
          'Bước 1: Đổi số thập phân 1.25 thành phân số: 1.25 = 125/100 = 5/4.',
          'Bước 2: Thay vào phép tính: 5/4 - 1/4.',
          'Bước 3: Vì hai phân số đã có chung mẫu số là 4, thực hiện trừ tử số: (5 - 1)/4 = 4/4 = 1.',
          'Kết quả đúng hoàn toàn là 1.'
        ]
      }
    ]
  },
  {
    id: 'loptay-hinh-hoc-tam-giac-bang-nhau',
    grade: '7',
    category: 'geometry',
    title: 'Các trường hợp bằng nhau của tam giác',
    description: 'Khám phá các phương pháp chứng minh hai tam giác thường và hai tam giác vuông bằng nhau: cạnh - cạnh - cạnh, cạnh - góc - cạnh, góc - cạnh - góc.',
    difficulty: 'medium',
    theory: {
      introduction: 'Hai tam giác được gọi là bằng nhau nếu chúng có các cạnh tương ứng bằng nhau và các góc tương ứng bằng nhau.',
      keyPoints: [
        'Trường hợp Cạnh - Cạnh - Cạnh (c-c-c): Nếu ba cạnh của tam giác này bằng ba cạnh của tam giác kia thì hai tam giác bằng nhau.',
        'Trường hợp Cạnh - Góc - Cạnh (c-g-c): Nếu hai cạnh và góc xen giữa của tam giác này bằng hai cạnh và góc xen giữa của tam giác kia thì hai tam giác bằng nhau.',
        'Trường hợp Góc - Cạnh - Góc (g-c-g): Nếu một cạnh và hai góc kề của tam giác này bằng một cạnh và hai góc kề của tam giác kia thì hai tam giác bằng nhau.'
      ],
      formulas: [
        { title: 'Quy tắc c-c-c', latex: 'AB=A\'B\', BC=B\'C\', AC=A\'C\'  =>  ΔABC = ΔA\'B\'C\'', explanation: 'Ký hiệu hai tam giác bằng nhau' }
      ],
      examples: [
        {
          question: 'Cho tam giác nhọn ABC, trên tia đối của tia AB lấy điểm D sao cho AD = AC. Trên tia đối của góc AC lấy E sao cho AE = AB. Chứng minh rằng tam giác ADE bằng tam giác ACB.',
          solution: 'Tìm các yếu tố bằng nhau giữa hai tam giác ADE và ACB.',
          steps: [
            'Bước 1: Xét hai tam giác ADE và ACB.',
            'Bước 2: Ta có AD = AC (theo giả thiết).',
            'Bước 3: Có góc DAE và góc CAB là hai góc đối đỉnh, nên góc DAE = góc CAB.',
            'Bước 4: Có AE = AB (theo giả thiết).',
            'Bước 5: Từ 3 điều trên, suy ra ΔADE = ΔACB theo trường hợp cạnh-góc-cạnh (c-g-c).'
          ]
        }
      ]
    },
    exercises: [
      {
        id: 'loptay-hh-tgbn-ex1',
        question: 'Nếu hai tam giác ABC và MNP có AB = MN, AC = MP, góc A = góc M. Ta kết luận hai tam giác này bằng nhau theo trường hợp nào?',
        type: 'multiple-choice',
        options: ['Cạnh - Cạnh - Cạnh (c-c-c)', 'Cạnh - Góc - Cạnh (c-g-c)', 'Góc - Cạnh - Góc (g-c-g)', 'Không đủ điều kiện kết luận'],
        correctAnswer: 'Cạnh - Góc - Cạnh (c-g-c)',
        stepByStep: [
          'Bước 1: Phân tích các cặp yếu tố bằng nhau đề bài cho: Cạnh AB tương ứng MN; Cạnh AC tương ứng MP.',
          'Bước 2: Góc A nằm xen giữa hai cạnh AB và AC; Góc M nằm xen giữa hai cạnh MN và MP.',
          'Bước 3: Vì góc bằng nhau chính là góc xen giữa hai cặp cạnh bằng nhau tương ứng.',
          'Bước 4: Do đó, hai tam giác bằng nhau theo trường hợp Cạnh - Góc - Cạnh (c-g-c).'
        ]
      }
    ]
  },

  // LỚP 8
  {
    id: 'lop8-dai-so-hang-dang-thuc',
    grade: '8',
    category: 'algebra',
    title: '7 Hằng đẳng thức đáng nhớ',
    description: 'Học thuộc lòng phát biểu và công thức của 7 hằng đẳng thức đáng nhớ áp dụng để rút gọn biểu thức, tính nhanh và phân tích đa thức thành nhân tử.',
    difficulty: 'medium',
    theory: {
      introduction: 'Hằng đẳng thức đáng nhớ là những công thức cơ bản và thường gặp nhất trong đại số giúp biến đổi các biểu thức đa thức phức tạp một cách nhanh gọn.',
      keyPoints: [
        'Giúp rút ngắn thời gian tính toán các lũy thừa đa thức bậc hai và bậc ba.',
        'Là công cụ cốt lõi để phân tích đa thức thành nhân tử (đóng vai trò quan trọng trong việc tìm nghiệm bài toán).',
        'Có thể áp dụng ngược để nhóm gọn một tam thức bậc hai về dạng bình phương hoàn chỉnh.'
      ],
      formulas: [
        { title: 'Bình phương một tổng', latex: '(A + B)^2 = A^2 + 2AB + B^2', explanation: 'Áp dụng cho mọi biểu thức A và B' },
        { title: 'Bình phương một hiệu', latex: '(A - B)^2 = A^2 - 2AB + B^2', explanation: 'Hiệu bình phương' },
        { title: 'Hiệu hai bình phương', latex: 'A^2 - B^2 = (A - B)(A + B)', explanation: 'Tích của tổng và hiệu' },
        { title: 'Lập phương một tổng', latex: '(A + B)^3 = A^3 + 3A^2B + 3AB^2 + B^3', explanation: 'Áp dụng lũy thừa bậc ba' },
        { title: 'Hiệu hai lập phương', latex: 'A^3 - B^3 = (A - B)(A^2 + AB + B^2)', explanation: 'Lưu ý phần bình phương thiếu dính dấu cộng' }
      ],
      examples: [
        {
          question: 'Khai triển biểu thức đại số: (x + 3y)²',
          solution: 'Áp dụng hằng đẳng thức thứ nhất: (A + B)² = A² + 2AB + B².',
          steps: [
            'Bước 1: Xác định vai trò: ở đây A = x, và B = 3y.',
            'Bước 2: Thay thế vào công thức khai triển: (x + 3y)² = x² + 2 * x * (3y) + (3y)².',
            'Bước 3: Thực hiện tính toán từng hạng tử: hạng tử giữa là 2 * x * 3y = 6xy; hạng tử cuối là (3y)² = 9y².',
            'Bước 4: Viết kết quả hoàn chỉnh: x² + 6xy + 9y².'
          ]
        },
        {
          question: 'Phân tích đa thức sau thành nhân tử: P = x² - 16',
          solution: 'Áp dụng hằng đẳng thức thứ ba: A² - B² = (A - B)(A + B).',
          steps: [
            'Bước 1: Nhận diện biểu thức x² hay 16. Ta thấy 16 có thể viết dưới dạng số mũ là 4².',
            'Bước 2: Biểu diễn lại đa thức: P = x² - 4².',
            'Bước 3: Áp dụng hằng đẳng thức hiệu hai bình phương với A = x và B = 4.',
            'Bước 4: Cho ra kết quả nhân tử: P = (x - 4)(x + 4).'
          ]
        }
      ]
    },
    exercises: [
      {
        id: 'lop8-ds-hdt-ex1',
        question: 'Khai triển của hằng đẳng thức biểu thức (2x - 1)² là kết quả nào sau đây?',
        type: 'multiple-choice',
        options: ['4x² - 1', '4x² - 4x + 1', '4x² - 2x + 1', '4x² + 4x + 1'],
        correctAnswer: '4x² - 4x + 1',
        stepByStep: [
          'Bước 1: Biểu thức là bình phương của một hiệu (A - B)² với A = 2x, B = 1.',
          'Bước 2: Thay vào công thức: (2x - 1)² = (2x)² - 2 * (2x) * 1 + 1².',
          'Bước 3: Tính toán các giá trị: (2x)² = 4x², -2 * 2x * 1 = -4x, 1² = 1.',
          'Bước 4: Gom kết quả khai triển: 4x² - 4x + 1. Đáp án chính xác là 4x² - 4x + 1.'
        ]
      },
      {
        id: 'lop8-ds-hdt-ex2',
        question: 'Biến đổi biểu thức x² - 10x + 25 về dạng bình phương một hiệu. Cho biết kết quả đúng?',
        type: 'multiple-choice',
        options: ['(x + 5)²', '(x - 5)²', '(x - 25)²', '(x - 10)³'],
        correctAnswer: '(x - 5)²',
        stepByStep: [
          'Bước 1: Quan sát biểu thức: x² - 10x + 25.',
          'Bước 2: Nhận ra hạng tử 25 chính là 5², x² là bình phương của x.',
          'Bước 3: Phân tích hạng tử ở giữa -10x: ta có -10x = -2 * x * 5, đúng với dạng cấu trúc hằng đẳng thức: A² - 2AB + B².',
          'Bước 4: Viết gọn lại thành bình phương của hiệu: (x - 5)².'
        ]
      }
    ]
  },
  {
    id: 'lop8-hinh-hoc-tam-giac-dong-dang',
    grade: '8',
    category: 'geometry',
    title: 'Tam giác đồng dạng & Định lí Thales',
    description: 'Nắm vững định lý Thales và tỉ số tương đồng cạnh trong tam giác, 3 trường hợp đồng dạng của tam giác (c-c-c, c-g-c, g-g) để chứng minh các góc bằng nhau.',
    difficulty: 'hard',
    theory: {
      introduction: 'Hai tam giác được gọi là đồng dạng nếu chúng có các góc tương ứng bằng nhau và các cạnh tương ứng tỉ lệ. Tỉ số các cạnh tương ứng gọi là tỉ số đồng dạng.',
      keyPoints: [
        'Định lí Thales: Nếu một đường thẳng song song với một cạnh của tam giác và cắt hai cạnh còn lại thì nó định ra trên hai cạnh đó những đoạn thẳng tương ứng tỉ lệ.',
        'Định lí đảo Thales: Dùng để chứng minh hai đường thẳng song song dựa trên tỉ lệ đoạn thẳng.',
        'Ba trường hợp đồng dạng thường gặp: Cạnh-Cạnh-Cạnh (nếu 3 cạnh tỉ lệ), Cạnh-Góc-Cạnh (nếu 2 cạnh tỉ lệ và góc xen giữa bằng), đặc biệt và dễ gặp nhất là trường hợp Góc-Góc (g-g) khi chỉ cần chứng minh 2 góc tương ứng bằng nhau.'
      ],
      formulas: [
        { title: 'Tỉ số Thales (DE // BC)', latex: 'AD/AB = AE/AC = DE/BC', explanation: 'D thuộc AB, E thuộc AC, DE song song BC' },
        { title: 'Ký hiệu đồng dạng', latex: 'ΔABC ∽ ΔA\'B\'C\'', explanation: 'Ký hiệu hai tam giác đồng dạng' }
      ],
      examples: [
        {
          question: 'Một cây cao bóng của nó dài trên mặt đất là 4m. Cùng một lúc, một cọc cắm thẳng đứng cao 1.5m có bóng dài 0.6m. Tính chiều cao của cây.',
          solution: 'Sử dụng cấu trúc tam giác đồng dạng được tạo lập bởi các tia nắng mặt trời song song với nhau.',
          steps: [
            'Bước 1: Mô hình hóa bài toán thành hai tam giác vuông đồng dạng do cùng một góc chiếu ánh sáng mặt trời.',
            'Bước 2: Gọi h là chiều cao của cây. Ta lập tỉ số đồng dạng: h / Chiều cao cọc = Bóng cây / Bóng cọc.',
            'Bước 3: Thay số vào tỉ lệ thức: h / 1.5 = 4 / 0.6.',
            'Bước 4: Giải tỉ lệ thức tìm h: h = (4 * 1.5) / 0.6 = 6 / 0.6 = 10 (m).',
            'Bước 5: Kết luận: Chiều cao tối ưu của cây là 10m.'
          ]
        }
      ]
    },
    exercises: [
      {
        id: 'lop8-hh-tgdd-ex1',
        question: 'Cho tam giác ABC có AB = 6cm, AC = 8cm. Một đường thẳng song song với BC cắt AB tại D, cắt AC tại E sao cho AD = 3cm. Tính độ dài đoạn thẳng AE?',
        type: 'text',
        correctAnswer: '4',
        stepByStep: [
          'Bước 1: Do DE song song với BC, áp dụng định lí Thales vào tam giác ABC.',
          'Bước 2: Hệ thức tỉ số: AD / AB = AE / AC.',
          'Bước 3: Thay các số đã biết vào hệ thức: 3 / 6 = AE / 8.',
          'Bước 4: Ta thấy 3 / 6 rút gọn là 1/2. Khi đó 1/2 = AE / 8.',
          'Bước 5: Tính AE = (1/2) * 8 = 4 cm. Vậy AE = 4.'
        ]
      }
    ]
  },

  // LỚP 9
  {
    id: 'lop9-dai-so-phuong-trinh-bac-hai',
    grade: '9',
    category: 'algebra',
    title: 'Phương trình bậc hai & Định lí Vi-ét',
    description: 'Cách giải phương trình bậc hai một ẩn số bằng phương pháp tính Viết Delta (Δ), hiểu số lượng nghiệm của phương trình và ứng dụng hệ thức Vi-ét vào các bài toán nâng cao.',
    difficulty: 'hard',
    theory: {
      introduction: 'Phương trình bậc hai một ẩn là phương trình có dạng ax² + bx + c = 0 (với a ≠ 0). Giải và biện luận nghiệm của nó dựa trên giá trị biệt thức Delta.',
      keyPoints: [
        'Biệt thức Δ (Delta) được tính bằng công thức: Δ = b² - 4ac.',
        'Nếu Δ > 0: Phương trình có hai nghiệm phân biệt.',
        'Nếu Δ = 0: Phương trình có nghiệm kép.',
        'Nếu Δ < 0: Phương trình vô nghiệm trên tập số thực.',
        'Hệ thức Vi-ét: Nếu phương trình có hai nghiệm x1, x2 thì Tổng là S = -b/a và Tích là P = c/a.'
      ],
      formulas: [
        { title: 'Công thức biệt thức Delta', latex: 'Δ = b^2 - 4ac', explanation: 'Biệt thức quyết định số lượng nghiệm' },
        { title: 'Nghiệm kép (khi Δ = 0)', latex: 'x1 = x2 = -b/(2a)', explanation: 'Nghiệm kép' },
        { title: 'Hai nghiệm phân biệt (khi Δ > 0)', latex: 'x = (-b ± \\sqrt{Δ}) / (2a)', explanation: 'Công thức nghiệm tổng quát' },
        { title: 'Định lí Vi-ét: Tổng nghiệm', latex: 'x1 + x2 = -b/a', explanation: 'Tổng hai nghiệm số' },
        { title: 'Định lí Vi-ét: Tích nghiệm', latex: 'x1 * x2 = c/a', explanation: 'Tích hai nghiệm số' }
      ],
      examples: [
        {
          question: 'Giải phương trình: x² - 5x + 6 = 0',
          solution: 'Áp dụng trực tiếp công thức tính Delta và tìm các nghiệm tương ứng.',
          steps: [
            'Bước 1: Xác định các hệ số: a = 1, b = -5, c = 6.',
            'Bước 2: Tính biệt thức Delta: Δ = b² - 4ac = (-5)² - 4 * 1 * 6 = 25 - 24 = 1.',
            'Bước 3: Vì Δ = 1 > 0, phương trình có 2 nghiệm phân biệt. Căn bậc hai của Delta là: √Δ = √1 = 1.',
            'Bước 4: Nghiệm thứ nhất: x1 = (-b + √Δ) / 2a = (5 + 1) / 2 = 6 / 2 = 3.',
            'Bước 5: Nghiệm thứ hai: x2 = (-b - √Δ) / 2a = (5 - 1) / 2 = 4 / 2 = 2.',
            'Bước 6: Tập nghiệm của phương trình là S = {2; 3}.'
          ]
        }
      ]
    },
    exercises: [
      {
        id: 'lop9-ds-ptbh-ex1',
        question: 'Hãy tính giá trị Δ (Delta) của phương trình x² - 4x + 4 = 0?',
        type: 'multiple-choice',
        options: ['16', '8', '0', '-8'],
        correctAnswer: '0',
        stepByStep: [
          'Bước 1: Xác định các hệ số: a = 1, b = -4, c = 4.',
          'Bước 2: Công thức tính biệt thức là: Δ = b² - 4ac.',
          'Bước 3: Thay số: Δ = (-4)² - 4 * 1 * 4 = 16 - 16 = 0.',
          'Bước 4: Kết quả Δ = 0 (phương trình có nghiệm kép).'
        ]
      },
      {
        id: 'lop9-ds-ptbh-ex2',
        question: 'Không giải phương trình x² - 7x + 10 = 0, hãy dùng hệ thức Vi-ét tính tổng (S) và tích (P) các nghiệm x1 và x2.',
        type: 'multiple-choice',
        options: ['S = -7, P = 10', 'S = 7, P = 10', 'S = 7, P = -10', 'S = 10, P = 7'],
        correctAnswer: 'S = 7, P = 10',
        stepByStep: [
          'Bước 1: Xác định các hệ số của phương trình: a = 1, b = -7, c = 10.',
          'Bước 2: Theo định lí Vi-ét, tổng hai nghiệm S = x1 + x2 = -b / a.',
          'Bước 3: S = -(-7) / 1 = 7.',
          'Bước 4: Theo định lí Vi-ét, tích hai nghiệm P = x1 * x2 = c / a = 10 / 1 = 10.',
          'Bước 5: Vậy S = 7, P = 10.'
        ]
      }
    ]
  },
  {
    id: 'lop9-hinh-hoc-duong-tron',
    grade: '9',
    category: 'geometry',
    title: 'Đường tròn & Các góc có liên quan',
    description: 'Tìm hiểu sâu về đường tròn, dây cung, các loại góc trong đường tròn: góc ở tâm, góc nội tiếp, góc tạo bởi tiếp tuyến và dây cung, tính liên kết tứ giác nội tiếp.',
    difficulty: 'hard',
    theory: {
      introduction: 'Đường tròn là tập hợp những điểm cách đều tâm một khoảng bằng bán kính. Đường tròn sở hữu các tính chất góc vô cùng quan trọng dùng để thi vào lớp 10 chuyên.',
      keyPoints: [
        'Góc ở tâm: Là góc có đỉnh trùng với tâm đường tròn. Số đo góc ở tâm bằng số đo cung bị chắn.',
        'Góc nội tiếp: Là góc có đỉnh nằm trên đường tròn và hai cạnh chứa hai dây cung của đường tròn đó. Số đo góc nội tiếp bằng nửa số đo cung bị chắn.',
        'Mối liên kết đặc biệt: Góc nội tiếp bằng nửa góc ở tâm khi cùng chắn một cung.',
        'Tứ giác nội tiếp: Là tứ giác có cả 4 đỉnh nằm trên cùng một đường tròn. Tính chất cốt lõi: Tổng hai góc đối diện luôn bằng 180 độ.'
      ],
      formulas: [
        { title: 'Góc nội tiếp chắn nửa đường tròn', latex: '{\\widehat{AMB}} = 90^{\\circ}', explanation: 'M thuộc (O), AB là đường kính.' },
        { title: 'Tính chất tứ giác nội tiếp ABCD', latex: '{\\widehat{A}} + {\\widehat{C}} = 180^{\\circ} , {\\widehat{B}} + {\\widehat{D}} = 180^{\\circ}', explanation: 'Tổng hai góc đối xứng' }
      ],
      examples: [
        {
          question: 'Cho tứ giác nội tiếp ABCD biết góc A = 110 độ. Tính số đo góc C?',
          solution: 'Áp dụng tính chất định lí tổng góc đối diện của một tứ giác nội tiếp.',
          steps: [
            'Bước 1: Cho ABCD là một tứ giác nội tiếp đường tròn.',
            'Bước 2: Biết tính chất tứ giác nội tiếp: Tổng hai góc đối nhau bằng 180 độ, nên ta có góc A + góc C = 180°.',
            'Bước 3: Thay số đo góc A vào: 110° + góc C = 180°.',
            'Bước 4: Tính số đo góc C: góc C = 180° - 110° = 70°.',
            'Kết quả góc C là 70°.'
          ]
        }
      ]
    },
    exercises: [
      {
        id: 'lop9-hh-dt-ex1',
        question: 'Góc nội tiếp chắn nửa đường tròn luôn có số đo bằng bao nhiêu độ?',
        type: 'multiple-choice',
        options: ['45°', '90°', '180°', '120°'],
        correctAnswer: '90°',
        stepByStep: [
          'Bước 1: Nửa đường tròn có số đo là 180°.',
          'Bước 2: Theo tính chất, góc nội tiếp có số đo bằng một nửa số đo của cung bị chắn.',
          'Bước 3: Vì góc nội tiếp chắn nửa đường tròn, cung bị chắn là nửa đường tròn (180°).',
          'Bước 4: Thực hiện phép tính: 180° : 2 = 90°.',
          'Do đó, góc nội tiếp chắn nửa đường tròn luôn luôn bằng 90° (góc vuông).'
        ]
      }
    ]
  }
];
