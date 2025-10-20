export interface MockRecommendationFind {
  id: string;
  headline: string;
  usage: string;
  priceRange: string;
  brand: string;
  screenSize: string;
  graphics: string;
  storage: string;
  laptop1Title: string;
  laptop1Brand: string;
  laptop1Model: string;
  laptop1Asin: string;
  laptop1Image: string;
  laptop1Rating: number;
  laptop1Reviews: number;
  laptop1Price: number;
  matchReason1: string;
  laptop2Title: string;
  laptop2Brand: string;
  laptop2Model: string;
  laptop2Asin: string;
  laptop2Image: string;
  laptop2Rating: number;
  laptop2Reviews: number;
  laptop2Price: number;
  matchReason2: string;
  findCount: number;
  createdAt: string;
}

export const mockRecentFinds: MockRecommendationFind[] = [
  {
    id: "1",
    headline: "Budget Gaming Beast",
    usage: "Gaming",
    priceRange: "$1000-$1500",
    brand: "ASUS",
    screenSize: "15.6+ inches (larger display)",
    graphics: "Dedicated GPU (gaming, design, video editing)",
    storage: "I need a good amount (500GB - 1000GB)",
    laptop1Title: "ASUS ROG Strix G16 Gaming Laptop",
    laptop1Brand: "ASUS",
    laptop1Model: "G614JV-AS73",
    laptop1Asin: "B0C3JXQZFH",
    laptop1Image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=800&fit=crop",
    laptop1Rating: 4.5,
    laptop1Reviews: 892,
    laptop1Price: 1299.99,
    matchReason1: "Perfect for AAA gaming at high settings",
    laptop2Title: "Lenovo Legion 5 Pro Gaming Laptop",
    laptop2Brand: "Lenovo",
    laptop2Model: "82WM0001US",
    laptop2Asin: "B0BT3KJB7V",
    laptop2Image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop",
    laptop2Rating: 4.6,
    laptop2Reviews: 1456,
    laptop2Price: 1399.99,
    matchReason2: "Superior cooling and RGB features",
    findCount: 342,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    headline: "Professional Workhorse",
    usage: "Business & Office Work",
    priceRange: "$800-$1200",
    brand: "Dell",
    screenSize: "14-16 inches (balanced)",
    graphics: "Integrated GPU (everyday tasks, battery efficiency)",
    storage: "Just enough for the basics (256GB - 500GB)",
    laptop1Title: "Dell Latitude 5430 Business Laptop",
    laptop1Brand: "Dell",
    laptop1Model: "5430-7842",
    laptop1Asin: "B09YJ7VH3K",
    laptop1Image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop",
    laptop1Rating: 4.4,
    laptop1Reviews: 678,
    laptop1Price: 999.99,
    matchReason1: "Enterprise-grade security features",
    laptop2Title: "HP EliteBook 840 G9",
    laptop2Brand: "HP",
    laptop2Model: "6F2V7UT",
    laptop2Asin: "B0B5QH3YCX",
    laptop2Image: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=800&fit=crop",
    laptop2Rating: 4.5,
    laptop2Reviews: 823,
    laptop2Price: 1099.99,
    matchReason2: "Best keyboard for long typing sessions",
    findCount: 287,
    createdAt: "2024-01-14T14:20:00Z"
  },
  {
    id: "3",
    headline: "Student Budget Champion",
    usage: "School & Education",
    priceRange: "$500-$800",
    brand: "No preference",
    screenSize: "14-16 inches (balanced)",
    graphics: "Integrated GPU (everyday tasks, battery efficiency)",
    storage: "I need a good amount (500GB - 1000GB)",
    laptop1Title: "Acer Aspire 5 Slim Laptop",
    laptop1Brand: "Acer",
    laptop1Model: "A515-57-53T2",
    laptop1Asin: "B0B5L1F7JQ",
    laptop1Image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=800&fit=crop",
    laptop1Rating: 4.3,
    laptop1Reviews: 2341,
    laptop1Price: 599.99,
    matchReason1: "Great battery life for all-day classes",
    laptop2Title: "ASUS VivoBook 15 Student Laptop",
    laptop2Brand: "ASUS",
    laptop2Model: "F1502ZA-AS74",
    laptop2Asin: "B0BWRCZ67Y",
    laptop2Image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=800&fit=crop",
    laptop2Rating: 4.4,
    laptop2Reviews: 1876,
    laptop2Price: 649.99,
    matchReason2: "Lightweight and portable for campus",
    findCount: 521,
    createdAt: "2024-01-13T09:45:00Z"
  },
  {
    id: "4",
    headline: "Premium Creative Studio",
    usage: "Photo Editing",
    priceRange: "$1500-$2500",
    brand: "Apple",
    screenSize: "14-16 inches (balanced)",
    graphics: "Dedicated GPU (gaming, design, video editing)",
    storage: "I need a lot (1000GB - 8000GB)",
    laptop1Title: "Apple MacBook Pro 14-inch M3",
    laptop1Brand: "Apple",
    laptop1Model: "MRX33LL/A",
    laptop1Asin: "B0CM5JV268",
    laptop1Image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop",
    laptop1Rating: 4.8,
    laptop1Reviews: 3421,
    laptop1Price: 1999.99,
    matchReason1: "Best color accuracy for photo work",
    laptop2Title: "Dell XPS 15 9530 Creator Laptop",
    laptop2Brand: "Dell",
    laptop2Model: "XPS9530-7996SLV-PUS",
    laptop2Asin: "B0C1GJXK5Q",
    laptop2Image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=800&fit=crop",
    laptop2Rating: 4.6,
    laptop2Reviews: 1234,
    laptop2Price: 2199.99,
    matchReason2: "Exceptional 4K OLED display",
    findCount: 198,
    createdAt: "2024-01-12T16:10:00Z"
  },
  {
    id: "5",
    headline: "Everyday Essential",
    usage: "Browsing & Streaming",
    priceRange: "$400-$700",
    brand: "No preference",
    screenSize: "13-14 inches (compact & portable)",
    graphics: "Integrated GPU (everyday tasks, battery efficiency)",
    storage: "Just enough for the basics (256GB - 500GB)",
    laptop1Title: "HP 15 Laptop Computer",
    laptop1Brand: "HP",
    laptop1Model: "15-dy5131wm",
    laptop1Asin: "B0BMXH1N54",
    laptop1Image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=800&fit=crop",
    laptop1Rating: 4.2,
    laptop1Reviews: 5678,
    laptop1Price: 549.99,
    matchReason1: "Perfect for streaming and web browsing",
    laptop2Title: "Lenovo IdeaPad 3 Laptop",
    laptop2Brand: "Lenovo",
    laptop2Model: "82RK00XNUS",
    laptop2Asin: "B0BT5GLXFK",
    laptop2Image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop",
    laptop2Rating: 4.3,
    laptop2Reviews: 4231,
    laptop2Price: 499.99,
    matchReason2: "Best value for basic computing needs",
    findCount: 765,
    createdAt: "2024-01-11T11:30:00Z"
  }
];
