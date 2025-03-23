
// Utility to get emoji and description for specification titles
interface SpecInfo {
  emoji: string;
  description?: string;
}

export function getSpecInfo(specName: string): SpecInfo {
  const specInfoMap: Record<string, SpecInfo> = {
    'Brand': { 
      emoji: '🏢', 
      description: 'The manufacturer of the laptop' 
    },
    'Model': { 
      emoji: '📱', 
      description: 'Specific laptop model' 
    },
    'Price': { 
      emoji: '💰', 
      description: 'Current price of the laptop' 
    },
    'Operating System': { 
      emoji: '🖥️', 
      description: 'Software that manages hardware resources' 
    },
    'Release Year': { 
      emoji: '📅', 
      description: 'Year the laptop was released' 
    },
    'Processor': { 
      emoji: '⚡', 
      description: 'Central processing unit (CPU)' 
    },
    'RAM': { 
      emoji: '🧠', 
      description: 'Random Access Memory for multitasking' 
    },
    'Storage': { 
      emoji: '💾', 
      description: 'Space for storing files and applications' 
    },
    'Graphics': { 
      emoji: '🎮', 
      description: 'Graphics processing unit (GPU)' 
    },
    'Screen Size': { 
      emoji: '📏', 
      description: 'Display size measured diagonally' 
    },
    'Screen Resolution': { 
      emoji: '🔍', 
      description: 'Number of pixels displayed on screen' 
    },
    'Refresh Rate': { 
      emoji: '🔄', 
      description: 'How many times per second the screen refreshes' 
    },
    'Weight': { 
      emoji: '⚖️', 
      description: 'Physical weight of the laptop' 
    },
    'Battery Life': { 
      emoji: '🔋', 
      description: 'How long the battery lasts on a single charge' 
    },
    'Ports': { 
      emoji: '🔌', 
      description: 'Available connection ports' 
    },
    'Rating': { 
      emoji: '⭐', 
      description: 'Average user rating' 
    },
    'Rating Count': { 
      emoji: '👥', 
      description: 'Number of user ratings' 
    },
    'Total Reviews': { 
      emoji: '📝', 
      description: 'Total number of user reviews' 
    },
    'Wilson Score': { 
      emoji: '📊', 
      description: 'Statistical confidence rating based on reviews and ratings' 
    },
    'Benchmark Score': { 
      emoji: '🏆', 
      description: 'Overall performance score based on hardware specifications' 
    }
  };

  return specInfoMap[specName] || { emoji: '📌' };
}
