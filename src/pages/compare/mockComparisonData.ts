export interface MockComparisonItem {
  id: string;
  leftLaptopTitle: string;
  rightLaptopTitle: string;
  leftLaptopBrand: string;
  rightLaptopBrand: string;
  leftLaptopModel: string;
  rightLaptopModel: string;
  winner: 'left' | 'right' | 'tie';
  keyDifferentiator: string;
  analysisSummary: string;
  leftLaptopPrice: number;
  rightLaptopPrice: number;
  comparisonCount: number;
  createdAt: string;
}

export const mockRecentComparisons: MockComparisonItem[] = [
  {
    id: '1',
    leftLaptopTitle: 'MacBook Pro 16" M3 Max',
    rightLaptopTitle: 'Dell XPS 15 9530',
    leftLaptopBrand: 'Apple',
    rightLaptopBrand: 'Dell',
    leftLaptopModel: 'MacBook Pro 16"',
    rightLaptopModel: 'XPS 15',
    winner: 'left',
    keyDifferentiator: 'Superior Performance & Battery Life',
    analysisSummary: 'The MacBook Pro M3 Max dominates with its impressive single-core and multi-core performance, delivering up to 22 hours of battery life. While the Dell XPS 15 offers great value at $1,299, the MacBook justifies its premium with unmatched efficiency.',
    leftLaptopPrice: 3499,
    rightLaptopPrice: 1299,
    comparisonCount: 247,
    createdAt: '2025-10-18T14:30:00Z'
  },
  {
    id: '2',
    leftLaptopTitle: 'ASUS ROG Zephyrus G14',
    rightLaptopTitle: 'Razer Blade 14',
    leftLaptopBrand: 'ASUS',
    rightLaptopBrand: 'Razer',
    leftLaptopModel: 'ROG Zephyrus G14',
    rightLaptopModel: 'Blade 14',
    winner: 'left',
    keyDifferentiator: 'Better Value for Gamers',
    analysisSummary: 'Both are excellent 14" gaming laptops, but the ASUS ROG Zephyrus G14 wins on value. At $1,599, it offers similar RTX 4060 performance to the $2,399 Razer Blade 14, with better battery life and more ports. The Razer has a slight edge in build quality.',
    leftLaptopPrice: 1599,
    rightLaptopPrice: 2399,
    comparisonCount: 189,
    createdAt: '2025-10-18T10:15:00Z'
  },
  {
    id: '3',
    leftLaptopTitle: 'ThinkPad X1 Carbon Gen 11',
    rightLaptopTitle: 'HP Elite Dragonfly G4',
    leftLaptopBrand: 'Lenovo',
    rightLaptopBrand: 'HP',
    leftLaptopModel: 'ThinkPad X1 Carbon',
    rightLaptopModel: 'Elite Dragonfly',
    winner: 'tie',
    keyDifferentiator: 'Both Excel at Business Use',
    analysisSummary: 'These business ultrabooks are nearly identical in capabilities. The ThinkPad offers legendary keyboard and durability, while the HP is slightly lighter at 2.2 lbs. Both feature excellent displays, long battery life, and strong security features. Choose based on brand preference.',
    leftLaptopPrice: 1849,
    rightLaptopPrice: 1799,
    comparisonCount: 156,
    createdAt: '2025-10-17T16:45:00Z'
  },
  {
    id: '4',
    leftLaptopTitle: 'Microsoft Surface Laptop 5',
    rightLaptopTitle: 'MacBook Air M2',
    leftLaptopBrand: 'Microsoft',
    rightLaptopBrand: 'Apple',
    leftLaptopModel: 'Surface Laptop 5',
    rightLaptopModel: 'MacBook Air M2',
    winner: 'right',
    keyDifferentiator: 'M2 Chip Outperforms Intel',
    analysisSummary: 'The MacBook Air M2 is the clear winner for most users. Its custom silicon delivers 2x the performance of the Surface Laptop 5\'s 12th gen Intel while maintaining fanless operation. The Surface offers more port variety and touchscreen, but can\'t match the Mac\'s efficiency.',
    leftLaptopPrice: 999,
    rightLaptopPrice: 1199,
    comparisonCount: 312,
    createdAt: '2025-10-17T09:20:00Z'
  },
  {
    id: '5',
    leftLaptopTitle: 'LG Gram 17',
    rightLaptopTitle: 'Dell XPS 17',
    leftLaptopBrand: 'LG',
    rightLaptopBrand: 'Dell',
    leftLaptopModel: 'Gram 17',
    rightLaptopModel: 'XPS 17',
    winner: 'left',
    keyDifferentiator: 'Incredibly Lightweight',
    analysisSummary: 'For portable productivity, the LG Gram 17 wins decisively. At just 2.98 lbs, it\'s nearly half the weight of the 5.34 lb XPS 17 while offering a larger 17" display. The Dell has better performance and build quality, but the Gram\'s portability is unmatched.',
    leftLaptopPrice: 1699,
    rightLaptopPrice: 1999,
    comparisonCount: 98,
    createdAt: '2025-10-16T13:10:00Z'
  },
  {
    id: '6',
    leftLaptopTitle: 'MSI Creator Z16P',
    rightLaptopTitle: 'MacBook Pro 14" M3 Pro',
    leftLaptopBrand: 'MSI',
    rightLaptopBrand: 'Apple',
    leftLaptopModel: 'Creator Z16P',
    rightLaptopModel: 'MacBook Pro 14"',
    winner: 'right',
    keyDifferentiator: 'Better Software Optimization',
    analysisSummary: 'For creative professionals, the MacBook Pro 14" M3 Pro edges ahead despite similar specs. Final Cut Pro and Adobe apps run smoother on Apple Silicon. The MSI offers more RAM upgradability and a larger display, but the MacBook\'s ecosystem integration is superior.',
    leftLaptopPrice: 2299,
    rightLaptopPrice: 2499,
    comparisonCount: 143,
    createdAt: '2025-10-15T11:30:00Z'
  }
];
