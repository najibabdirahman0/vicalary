export type TapeId = 'camera' | 'scanner' | 'cookbook' | 'budget' | 'coach' | 'spiritual';

export interface TapeProduct {
  id: TapeId;
  name: string;
  persona: string;
  shortLabel: string;
  bg: string;
  ring: string;
  wordColor: string;
  tagBg: string;
  tagInk: string;
  ink: string;
  stripColor: string;
  stripBackColor: string;
  tags: string[];
  copy: string;
  specs: {
    widths: string;
    length: string;
    backing: string;
    adhesion: string;
  };
  idealFor: string[];
  showcaseImages: [string, string];
}

export const ICON_IMAGES: Record<TapeId, string> = {
  camera: '/src/assets/vicalary/icons/cute-camera.gif',
  scanner: '/src/assets/vicalary/icons/scan.gif',
  cookbook: '/src/assets/vicalary/icons/chef.gif',
  budget: '/src/assets/vicalary/icons/money-bag.gif',
  coach: '/src/assets/vicalary/icons/dinner.gif',
  spiritual: '/src/assets/vicalary/icons/clock.gif',
};

export const IMAGES = {
  appLogo: '/src/assets/vicalary/app-logo.png',
  favicon: '/src/assets/vicalary/favicon.png',
  landingHero: '/src/assets/vicalary/landing-page.png',
  grilledChicken: '/src/assets/vicalary/grilled-chicken.jpg',
  dietaryPreference: '/src/assets/vicalary/dietary-preference.jpg',
  foodAllergies: '/src/assets/vicalary/food-allergies.jpg',
  allergyAvoidance: '/src/assets/vicalary/onboarding-q10.png',
  cookingSkill: '/src/assets/vicalary/cooking-skill.jpg',
  preparationTime: '/src/assets/vicalary/preparation-time.jpg',
  cookingWoman: '/src/assets/vicalary/onboarding-q7.png',
  weeklyBudget: '/src/assets/vicalary/weekly-budget.jpg',
  activityLevel: '/src/assets/vicalary/activity-level.jpg',
  calorieProgress: '/src/assets/vicalary/daily-reminders.jpg',
  calmRest: '/src/assets/vicalary/sleep-duration.jpg',
  dailyStress: '/src/assets/vicalary/daily-stress.jpg',
  mindfulChoice: '/src/assets/vicalary/verification-illustration.png',
  hijabBowlSticker:
    'https://res.cloudinary.com/koc0fyuc/image/upload/v1795283897/Smiling_Hijab_Woman_with_Vegetable_Bowl_mppguo.png',
} as const;

export const TAPES: TapeProduct[] = [
  {
    id: 'camera',
    name: 'Meal Camera',
    persona: 'VISION',
    shortLabel: 'CAMERA',
    bg: '#F1CA9E',
    ring: '#FFF3DF',
    wordColor: '#0D2F4F',
    tagBg: '#0D2F4F',
    tagInk: '#D9F7C4',
    ink: '#0D2F4F',
    stripColor: '#D9F7C4',
    stripBackColor: '#A6EB67',
    tags: ['PHOTO LOGGING', 'MACRO BREAKDOWN', 'PORTION RANGE'],
    copy: 'Snap a quick photo of any plate for instant calories, macros, and normalized ingredient facts. Effortless. Clear. Zero guesswork.',
    specs: {
      widths: 'Calories / Protein / Carbs / Fat',
      length: 'Multi-Food Visual Normalization',
      backing: 'Verified Food Nutrition Database',
      adhesion: '1-Tap Add to Daily Diary',
    },
    idealFor: [
      'Instant meal decomposition from a single camera frame',
      'Honest calorie ranges scaled to real portion variance',
      'Vitamin & mineral insights mapped to your daily goal',
    ],
    showcaseImages: [IMAGES.grilledChicken, IMAGES.dietaryPreference],
  },
  {
    id: 'scanner',
    name: 'Barcode Scanner',
    persona: 'VERIFIER',
    shortLabel: 'SCANNER',
    bg: '#CBE8FF',
    ring: '#EBF6FF',
    wordColor: '#0B3C7C',
    tagBg: '#0B3C7C',
    tagInk: '#D9F7C4',
    ink: '#0D2F4F',
    stripColor: '#FFFFFF',
    stripBackColor: '#DCEBF7',
    tags: ['PRODUCT FACTS', 'ALLERGY GATE', 'LOCAL PRICING'],
    copy: 'The scanner that checks every label. Verified ingredients, allergy safety gates, ethical boycott flags, and live local pricing.',
    specs: {
      widths: 'Auto-Scan in 5s / Manual Tap',
      length: 'Deterministic Parent-Chain Check',
      backing: 'Verified Local & Currency Engine',
      adhesion: 'Direct Expenditure & Diary Handoff',
    },
    idealFor: [
      'Deterministic barcode lookups with zero hallucinated nutrition',
      'Automatic allergen, dietary, and ethical responsibility gates',
      'Instant deduction of scanned grocery items from daily budget',
    ],
    showcaseImages: [IMAGES.foodAllergies, IMAGES.allergyAvoidance],
  },
  {
    id: 'cookbook',
    name: 'Smart Cookbook',
    persona: 'CHEF',
    shortLabel: 'COOKBOOK',
    bg: '#FFD6DF',
    ring: '#FFF0F3',
    wordColor: '#9D174D',
    tagBg: '#FF3366',
    tagInk: '#FFFFFF',
    ink: '#0D2F4F',
    stripColor: '#FFF7BD',
    stripBackColor: '#EBD98A',
    tags: ['7-DAY PLANS', 'TIMED MEALS', 'STEP-BY-STEP'],
    copy: 'From 15-minute breakfasts to balanced family dinners. Tailored to your allergies, halal standards, and cooking comfort.',
    specs: {
      widths: 'Breakfast / Lunch / Dinner / Snacks',
      length: '7-Day Multi-Category Meal Plans',
      backing: 'Time-Aware Morning, Midday & Evening',
      adhesion: 'Guided Voice Cooking Walkthroughs',
    },
    idealFor: [
      'Morning, midday, and evening suggestions tuned to local time',
      'Strict adherence to Halal, Vegetarian, Vegan, or allergy filters',
      'Step-by-step recipe prep matched to 15–60 minute schedules',
    ],
    showcaseImages: [IMAGES.preparationTime, IMAGES.cookingWoman],
  },
  {
    id: 'budget',
    name: 'Food Budget',
    persona: 'KEEPER',
    shortLabel: 'BUDGET',
    bg: '#0B3C7C',
    ring: '#D9F7C4',
    wordColor: '#A6EB67',
    tagBg: '#A6EB67',
    tagInk: '#0D2F4F',
    ink: '#D9F7C4',
    stripColor: '#D9F7C4',
    stripBackColor: '#A6EB67',
    tags: ['DAILY ALLOWANCE', 'SCAN DEDUCTION', '30-DAY CYCLE'],
    copy: 'Doesn’t complicate numbers. Turns monthly spending goals into a clear daily food allowance with multi-currency awareness.',
    specs: {
      widths: 'Daily Allowance / 30-Day Cycle',
      length: '20+ Global Currencies & FX',
      backing: 'Onboarding-Derived Spending Ledger',
      adhesion: 'Real-Time Over-Allowance Alerts',
    },
    idealFor: [
      'Automatic daily allowance derived from your weekly or monthly target',
      'Location-aware currency conversion and retail pricing truth',
      'Live tracking as scanned supermarket items deduct from today',
    ],
    showcaseImages: [IMAGES.weeklyBudget, IMAGES.preparationTime],
  },
  {
    id: 'coach',
    name: 'Health Coach',
    persona: 'COACH',
    shortLabel: 'COACH',
    bg: '#A6EB67',
    ring: '#D9F7C4',
    wordColor: '#0D2F4F',
    tagBg: '#0D2F4F',
    tagInk: '#D9F7C4',
    ink: '#0D2F4F',
    stripColor: '#FFFFFF',
    stripBackColor: '#D9F7C4',
    tags: ['VOICE GUIDANCE', 'LIVE CHAT', '7-DAY CHECKPOINTS'],
    copy: 'Counting macros or navigating weekly milestones? Your warm human-like voice and messaging coach shows up every single day.',
    specs: {
      widths: 'Low-Latency Voice & Real-Time Chat',
      length: '7-Day Checkpoints & Progress Cards',
      backing: 'Personalized Profile & Goal Context',
      adhesion: 'Direct Coach & Verified Peer Calls',
    },
    idealFor: [
      'Real-time voice dialogue while cooking or shopping on the go',
      'Instant messaging with read receipts, voice notes & reactions',
      'Weekly weight and reflection check-ins synced cleanly',
    ],
    showcaseImages: [IMAGES.activityLevel, IMAGES.calorieProgress],
  },
  {
    id: 'spiritual',
    name: 'Faith & Calm',
    persona: 'ANCHOR',
    shortLabel: 'FAITH',
    bg: '#E4DFFF',
    ring: '#F4F1FF',
    wordColor: '#3B288F',
    tagBg: '#6A4DFD',
    tagInk: '#FFFFFF',
    ink: '#0D2F4F',
    stripColor: '#D9F7C4',
    stripBackColor: '#A6EB67',
    tags: ['PRAYER WINDOWS', 'QURAN & HADITH', 'HIJRI TIMELINE'],
    copy: 'Timed to local prayer windows with contextual Quranic and Hadith reflections. Calm habits. Holistic daily balance.',
    specs: {
      widths: 'Fajr / Dhuhr / Asr / Maghrib / Isha',
      length: 'IP-Aware Prayer Time Windows',
      backing: 'Curated Authentic Quran & Hadith',
      adhesion: 'Integrated Hijri Milestone Calendar',
    },
    idealFor: [
      'Contextual spiritual reminders surfaced gently during prayer windows',
      'Hijri calendar timeline tracking daily wellness & prayer harmony',
      '21+ supported languages matching your location automatically',
    ],
    showcaseImages: [IMAGES.calmRest, IMAGES.mindfulChoice],
  },
];

export const PRELOADER_LAYERS = [
  { id: 'cookbook', bg: '#FFD6DF', z: 6 },
  { id: 'camera', bg: '#F1CA9E', z: 5 },
  { id: 'spiritual', bg: '#E4DFFF', z: 4 },
  { id: 'coach', bg: '#A6EB67', z: 3 },
  { id: 'scanner', bg: '#CBE8FF', z: 2 },
  { id: 'budget', bg: '#0B3C7C', z: 1 },
] as const;

export const NEWS_ITEMS = [
  {
    id: 'zero-hallucination',
    date: 'November 2026',
    category: 'Safety & Truth',
    title: 'Zero-Hallucination Scanner & Allergen Responsibility Gate',
    excerpt:
      'Every barcode scan in VICALARY enforces deterministic ingredient verification, allergy safety alerts, parent-chain ethical checks, and verified local pricing.',
    image: IMAGES.foodAllergies,
  },
  {
    id: 'voice-chef-launch',
    date: 'October 2026',
    category: 'Kitchen & Prep',
    title: 'Guided Home Cooking & 7-Day Time-Aware Meal Plans',
    excerpt:
      'Cook step-by-step recipes matched to your schedule and skill level, with Halal and allergy guardrails automatically woven into every dish.',
    image: IMAGES.cookingWoman,
  },
  {
    id: 'spiritual-prayer-sync',
    date: 'September 2026',
    category: 'Wellness',
    title: 'Body & Soul: Calm Rest, Prayer Windows & Hijri Checkpoints',
    excerpt:
      'Discover how VICALARY pairs 30-day nutrition and food budget discipline with restful evenings, local prayer windows, and contextual Quranic reflections.',
    image: IMAGES.calmRest,
  },
];
