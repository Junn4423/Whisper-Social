import { Confession } from '@/types';

// Mock confessions data - Dữ liệu mẫu
export const mockConfessions: Confession[] = [
  {
    id: '1',
    text: 'Tôi thầm thích một người trong lớp suốt 3 năm nhưng chưa bao giờ dám thổ lộ. Mỗi lần nhìn thấy người ấy, tim tôi đập thật nhanh... 💕',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    gender: 'Nữ',
    age: 22,
    isAnonymous: true,
    createdAt: new Date('2024-12-26'),
  },
  {
    id: '2',
    text: 'Có ai từng cảm thấy cô đơn giữa đám đông chưa? Tôi có rất nhiều bạn bè nhưng không ai thực sự hiểu tôi... 🌙',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    gender: 'Nam',
    age: 25,
    isAnonymous: true,
    createdAt: new Date('2024-12-25'),
  },
  {
    id: '3',
    text: 'Tôi vừa chia tay người yêu 5 năm. Đau lắm nhưng biết đây là quyết định đúng đắn. Ai ở đây có thể lắng nghe tôi không? 😢',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    gender: 'Nữ',
    age: 27,
    isAnonymous: true,
    createdAt: new Date('2024-12-24'),
  },
  {
    id: '4',
    text: 'Confession: Tôi đang yêu thầm crush của bạn thân. Không biết phải làm sao... Có nên thú nhận không? 💔',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    gender: 'Nam',
    age: 23,
    isAnonymous: true,
    createdAt: new Date('2024-12-23'),
  },
  {
    id: '5',
    text: 'Tôi là một người hướng nội, nhưng đôi khi tôi cũng muốn có ai đó để trò chuyện lúc đêm khuya. Ai còn thức không? 🌃',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    gender: 'Nữ',
    age: 21,
    isAnonymous: true,
    createdAt: new Date('2024-12-22'),
  },
  {
    id: '6',
    text: 'Just broke up with my girlfriend after 2 years. Feeling lost but also relieved. Anyone want to chat? 🥺',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    gender: 'Nam',
    age: 28,
    isAnonymous: true,
    createdAt: new Date('2024-12-21'),
  },
  {
    id: '7',
    text: 'Tôi có một bí mật mà chưa từng nói với ai. Đôi khi gánh nặng này khiến tôi không thở nổi... 🤐',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
    gender: 'Nữ',
    age: 24,
    isAnonymous: true,
    createdAt: new Date('2024-12-20'),
  },
  {
    id: '8',
    text: 'Looking for someone to have deep conversations with at 2am. Anyone else feeling lonely tonight? 🌙✨',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    gender: 'Nam',
    age: 26,
    isAnonymous: true,
    createdAt: new Date('2024-12-19'),
  },
];

// Bot responses cho chat - Phản hồi tự động của bot
export const botResponses = {
  vi: [
    'Xin chào! Cảm ơn bạn đã nhắn tin. Mình rất vui được trò chuyện với bạn! 💜',
    'Mình hiểu cảm giác của bạn. Đôi khi cuộc sống thật phức tạp phải không? 🌙',
    'Bạn có muốn chia sẻ thêm không? Mình luôn sẵn sàng lắng nghe... ✨',
    'Thật tuyệt khi được kết nối với bạn. Hy vọng chúng ta có thể trở thành bạn! 💕',
    'Wow, câu chuyện của bạn thật thú vị! Kể thêm đi... 🥰',
    'Mình cũng từng trải qua điều tương tự. Bạn không đơn độc đâu! 🤗',
  ],
  en: [
    "Hey there! Thanks for reaching out. I'm happy to chat with you! 💜",
    "I understand how you feel. Life can be complicated sometimes, right? 🌙",
    "Would you like to share more? I'm always here to listen... ✨",
    "It's great connecting with you. Hope we can be friends! 💕",
    "Wow, your story is so interesting! Tell me more... 🥰",
    "I've been through something similar. You're not alone! 🤗",
  ],
};

// Tạo ID ngẫu nhiên
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
