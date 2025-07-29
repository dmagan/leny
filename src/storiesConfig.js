// storiesConfig.js
// فایل تنظیمات قصه‌ها - لینک‌های فایل‌های صوتی و تصاویر

export const STORIES_CONFIG = [
  {
    id: 1,
    title: "سیندرلا",
    audioUrl: "https://lenytoys.ir/wp-content/uploads/2025/07/sinderela.mp3",
    duration: null, // خودش محاسبه می‌شود
    image: "https://lenytoys.ir/wp-content/uploads/2025/07/image.jpg",
    description: "قصه‌ای کلاسیک برای کودکان"
  },
  {
    id: 2,
    title: "یه گوسفند، دو تا گوسفند یه خواب راحت",
    audioUrl: "https://lenytoys.ir/wp-content/uploads/2025/07/1gosfand-2gosfand.mp3", 
    duration: null, // خودش محاسبه می‌شود
    image: "https://lenytoys.ir/wp-content/uploads/2025/07/se-khers-koochoolo.jpg",
    description: "ماجراجویی سه خرس کوچولو"
  },
  {
    id: 3,
    title: "از دانه تا سیب",
    audioUrl: "https://lenytoys.ir/wp-content/uploads/2025/07/az-dane-ta-sib.mp3",
    duration: null, // خودش محاسبه می‌شود
    image: "https://lenytoys.ir/wp-content/uploads/2025/07/bare-naghela.jpg",
    description: "قصه پرماجرای بره ناقلا"
  },
  {
    id: 4,
    title: "بند انگشتی",
    audioUrl: "https://lenytoys.ir/wp-content/uploads/2025/07/band-angoshti.mp3",
    duration: null, // خودش محاسبه می‌شود
    image: "https://lenytoys.ir/wp-content/uploads/2025/07/robah-va-kolagh.jpg", 
    description: "درس عبرتی از روباه و کلاغ"
  },
  {
    id: 5,
    title: "احترام به بزرگترها",
    audioUrl: "https://lenytoys.ir/wp-content/uploads/2025/07/ehteram-be-bozorgtarha.mp3",
    duration: null, // خودش محاسبه می‌شود
    image: "https://lenytoys.ir/wp-content/uploads/2025/07/shahzade-ghoorbagheh.jpg",
    description: "قصه جادویی شاهزاده قورباغه"
  },
    {
    id: 6,
    title: "گنجشک فراموش کار",
    audioUrl: "https://lenytoys.ir/wp-content/uploads/2025/07/gonjeshke-faramoshka.mp3",
    duration: null, // خودش محاسبه می‌شود
    image: "https://lenytoys.ir/wp-content/uploads/2025/07/shahzade-ghoorbagheh.jpg",
    description: "قصه جادویی شاهزاده قورباغه"
  },

];

// تنظیمات پخش‌کننده
export const PLAYER_CONFIG = {
  skipDuration: 15, // ثانیه
  autoPlay: false,
  showPlaylist: true,
  enableDownload: false, // برای لینک‌های خارجی معمولاً false
  maxRetries: 3,
  cacheDurations: true, // فعال‌سازی کش مدت زمان
  cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7 روز (میلی‌ثانیه)
};

// برای دسته‌بندی قصه‌ها (اختیاری)
export const STORY_CATEGORIES = {
  CLASSIC: 'کلاسیک',
  ADVENTURE: 'ماجراجویی', 
  EDUCATIONAL: 'آموزشی',
  COMEDY: 'طنز',
  MORAL: 'اخلاقی'
};

// اگر می‌خواهید قصه‌ها را دسته‌بندی کنید
export const CATEGORIZED_STORIES = {
  [STORY_CATEGORIES.CLASSIC]: [1, 2],
  [STORY_CATEGORIES.ADVENTURE]: [3, 5],
  [STORY_CATEGORIES.MORAL]: [4],
};