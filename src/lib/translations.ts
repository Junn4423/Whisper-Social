import { Translations } from '@/types';

export const translations: Translations = {
  // Header
  appName: {
    vi: 'WhisperPay',
    en: 'WhisperPay',
  },
  coins: {
    vi: 'Xu',
    en: 'Coins',
  },
  home: {
    vi: 'Trang chủ',
    en: 'Home',
  },
  createPost: {
    vi: 'Đăng bài',
    en: 'Post',
  },

  // Confession Card
  unlockPhoto: {
    vi: 'Mở khóa ảnh',
    en: 'Unlock Photo',
  },
  chatNow: {
    vi: 'Nhắn tin ngay',
    en: 'Chat Now',
  },
  yearsOld: {
    vi: 'tuổi',
    en: 'years old',
  },
  anonymous: {
    vi: 'Ẩn danh',
    en: 'Anonymous',
  },
  photoUnlocked: {
    vi: 'Đã mở khóa',
    en: 'Unlocked',
  },
  chatUnlocked: {
    vi: 'Đã mở khóa',
    en: 'Unlocked',
  },

  // Create Post Page
  createConfession: {
    vi: 'Tạo confession mới',
    en: 'Create New Confession',
  },
  yourConfession: {
    vi: 'Confession của bạn',
    en: 'Your Confession',
  },
  confessionPlaceholder: {
    vi: 'Chia sẻ tâm sự của bạn tại đây... 💭',
    en: 'Share your confession here... 💭',
  },
  imageUrl: {
    vi: 'Link ảnh đại diện',
    en: 'Avatar Image URL',
  },
  imageUrlPlaceholder: {
    vi: 'Dán link ảnh vào đây...',
    en: 'Paste image URL here...',
  },
  selectGender: {
    vi: 'Chọn giới tính',
    en: 'Select Gender',
  },
  male: {
    vi: 'Nam',
    en: 'Male',
  },
  female: {
    vi: 'Nữ',
    en: 'Female',
  },
  other: {
    vi: 'Khác',
    en: 'Other',
  },
  age: {
    vi: 'Tuổi',
    en: 'Age',
  },
  anonymousMode: {
    vi: 'Chế độ ẩn danh',
    en: 'Anonymous Mode',
  },
  postConfession: {
    vi: 'Đăng Confession',
    en: 'Post Confession',
  },

  // Chat Page
  typeMessage: {
    vi: 'Nhập tin nhắn...',
    en: 'Type a message...',
  },
  send: {
    vi: 'Gửi',
    en: 'Send',
  },
  chattingWith: {
    vi: 'Đang nhắn tin với',
    en: 'Chatting with',
  },
  backToHome: {
    vi: 'Về trang chủ',
    en: 'Back to Home',
  },

  // Top Up Modal
  topUp: {
    vi: 'Nạp Xu',
    en: 'Top Up',
  },
  notEnoughCoins: {
    vi: 'Không đủ xu!',
    en: 'Not enough coins!',
  },
  buyCoins: {
    vi: 'Mua thêm xu để tiếp tục',
    en: 'Buy more coins to continue',
  },
  selectPackage: {
    vi: 'Chọn gói xu',
    en: 'Select Package',
  },
  popular: {
    vi: 'Phổ biến',
    en: 'Popular',
  },
  bestValue: {
    vi: 'Giá tốt nhất',
    en: 'Best Value',
  },
  buy: {
    vi: 'Mua ngay',
    en: 'Buy Now',
  },
  cancel: {
    vi: 'Hủy',
    en: 'Cancel',
  },

  // Hero Section
  heroTitle: {
    vi: 'Confession Ẩn Danh',
    en: 'Anonymous Confessions',
  },
  heroSubtitle: {
    vi: 'Chia sẻ bí mật. Kết nối tâm hồn. Mở khóa những khoảnh khắc đặc biệt.',
    en: 'Share secrets. Connect souls. Unlock special moments.',
  },
  exploreNow: {
    vi: 'Khám phá ngay',
    en: 'Explore Now',
  },

  // Feed
  latestConfessions: {
    vi: '🔥 Confession mới nhất',
    en: '🔥 Latest Confessions',
  },
  noConfessions: {
    vi: 'Chưa có confession nào',
    en: 'No confessions yet',
  },

  // Success Messages
  confessionPosted: {
    vi: 'Confession đã được đăng thành công! 🎉',
    en: 'Confession posted successfully! 🎉',
  },
  coinsAdded: {
    vi: 'Đã nạp xu thành công! 💰',
    en: 'Coins added successfully! 💰',
  },

  // Language Toggle
  language: {
    vi: 'Ngôn ngữ',
    en: 'Language',
  },
  vietnamese: {
    vi: 'Tiếng Việt',
    en: 'Vietnamese',
  },
  english: {
    vi: 'English',
    en: 'English',
  },
};

export const t = (key: string, lang: 'vi' | 'en'): string => {
  return translations[key]?.[lang] || key;
};
