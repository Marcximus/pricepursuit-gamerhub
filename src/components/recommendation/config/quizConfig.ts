// iOS-style emojis for different option types
export const usageEmojis = [
  '🎓', // School/Education
  '💼', // Business/Office Work
  '🎬', // Video Editing
  '📸', // Photo Editing
  '🤖', // AI/Machine Learning
  '🎮', // Gaming
  '💻', // Programming/Coding
  '🌐', // Web Browsing/Everyday Use
  '🎨', // Content Creation
  '📊', // 3D Modeling/CAD
];

export const priceRangeEmojis = [
  '💰', // USD 100 - 300
  '💸', // USD 300 - 600
  '💵', // USD 600 - 900
  '💴', // USD 900 - 1200
  '💶', // USD 1200 - 1500
  '💷', // USD 1500 - 2000
  '💎', // USD 2000 - 2500
  '💲', // USD 3000 - 4000
  '👑', // USD 4000 - 6000
  '⚙️', // Custom Range
];

export const brandEmojis = [
  '🌐', // No preference
  '🔵', // Dell
  '⚪', // HP
  '🔴', // Lenovo
  '🍎', // Apple
  '🔷', // ASUS
  '🟢', // LG (swapped with Acer)
  '🐉', // MSI
  '🪟', // Microsoft Surface
  '📱', // Samsung
  '🐍', // Razer
  '🌈', // Acer (swapped with LG)
  '⚡', // Gigabyte
  '🔶', // Toshiba
];

export const screenSizeEmojis = [
  '📱', // 10-13+ inches
  '💻', // 14-16+ inches
  '🖥️', // 17-19+ inches
];

export const graphicsEmojis = [
  '📊', // Integrated graphics
  '🎮', // Dedicated GPU
  '🚀', // High-end GPU
];

export const storageEmojis = [
  '💾', // Not much
  '💿', // I need a bit
  '🗄️', // I need a lot
];

// Question options
export const usageOptions = [
  'School & Education', 
  'Business & Office Work', 
  'Video Editing',
  'Photo Editing', 
  'AI & Machine Learning', 
  'Gaming', 
  'Programming & Coding',
  'Web Browsing & Everyday Use',
  'Content Creation',
  '3D Modeling & CAD'
];

export const priceRangeOptions = [
  'USD 100 - 300',
  'USD 300 - 600',
  'USD 600 - 900',
  'USD 900 - 1200',
  'USD 1200 - 1500',
  'USD 1500 - 2000',
  'USD 2000 - 2500',
  'USD 3000 - 4000',
  'USD 4000 - 6000',
  'Custom Range'
];

export const brandOptions = [
  'No preference',
  'Dell',
  'HP',
  'Lenovo',
  'Apple',
  'ASUS',
  'LG', // Swapped with Acer
  'MSI',
  'Microsoft Surface',
  'Samsung',
  'Razer',
  'Acer', // Swapped with LG
  'Gigabyte',
  'Toshiba'
];

export const screenSizeOptions = [
  '10-13+ inches (ultra-portable)',
  '14-16+ inches (balanced)',
  '17-19+ inches (desktop replacement)'
];

export const graphicsOptions = [
  'Integrated graphics (basic tasks)',
  'Dedicated GPU (gaming, design, video editing)',
  'High-end GPU (advanced rendering, AAA gaming)'
];

export const storageOptions = [
  'Not much (200 GB - 500GB)',
  'I need a bit (500 GB - 1000GB)',
  'I need a lot (1000GB - 8000GB)'
];

export const quizQuestions = [
  {
    id: 'usage',
    question: 'What are you going to use it for?',
    options: usageOptions,
    emojis: usageEmojis
  },
  {
    id: 'priceRange',
    question: 'What is your price range?',
    options: priceRangeOptions,
    emojis: priceRangeEmojis
  },
  {
    id: 'brand',
    question: 'Do you have a preferred brand?',
    options: brandOptions,
    emojis: brandEmojis
  },
  {
    id: 'screenSize',
    question: 'What is your desired screen size?',
    options: screenSizeOptions,
    emojis: screenSizeEmojis
  },
  {
    id: 'graphics',
    question: 'What are your graphics requirements?',
    options: graphicsOptions,
    emojis: graphicsEmojis
  },
  {
    id: 'storage',
    question: "What's your storage preference?",
    options: storageOptions,
    emojis: storageEmojis
  }
];
