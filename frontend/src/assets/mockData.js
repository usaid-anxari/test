import Logo from './TrueTestify.png'
export const MOCK_REVIEWS = [
  {
    id: "13cd4d7f-0f97-426a-846e-eadd805745a1",
    type: "video",
    title: "Great Customer Service",
    rating: 5,
    reviewerName: "John Smith",
    bodyText: "The customer service team was incredibly helpful and responsive. They went above and beyond to solve my issue.",
    status: "approved",
    publishedAt: "2025-01-15T10:30:00Z",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:35:00Z",
    media: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    id: "13cd4d7f-0f97-426a-846e-eadd805745a2",
    type: "audio",
    title: "Amazing Product!",
    rating: 5,
    reviewerName: "Sara Johnson",
    bodyText: "This product exceeded all my expectations. The quality is outstanding and it's so easy to use.",
    status: "approved",
    publishedAt: "2025-01-14T14:20:00Z",
    createdAt: "2025-01-14T14:20:00Z",
    updatedAt: "2025-01-14T14:25:00Z",
    media: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: "13cd4d7f-0f97-426a-846e-eadd805745a3",
    type: "text",
    title: "So easy to use",
    rating: 4,
    reviewerName: "Mike Chen",
    bodyText: "The user interface is intuitive and I love the design. I would recommend this to anyone!",
    status: "approved",
    publishedAt: "2025-01-13T09:15:00Z",
    createdAt: "2025-01-13T09:15:00Z",
    updatedAt: "2025-01-13T09:20:00Z",
    media: []
  },
  {
    id: "13cd4d7f-0f97-426a-846e-eadd805745a4",
    type: "video",
    title: "Fast and reliable",
    rating: 5,
    reviewerName: "Emily Davis",
    bodyText: "The performance is incredible and it never lets me down. Highly recommended!",
    status: "approved",
    publishedAt: "2025-01-12T16:45:00Z",
    createdAt: "2025-01-12T16:45:00Z",
    updatedAt: "2025-01-12T16:45:00Z",
    media:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: "13cd4d7f-0f97-426a-846e-eadd805745a5",
    type: "text",
    title: "Life-changing!",
    rating: 5,
    reviewerName: "Alex Rodriguez",
    bodyText: "I never thought a product could be this good. It has completely changed my workflow for the better.",
    status: "approved",
    publishedAt: "2025-01-11T11:30:00Z",
    createdAt: "2025-01-11T11:30:00Z",
    updatedAt: "2025-01-11T11:35:00Z",
    media: []
  },
  {
    id: "13cd4d7f-0f97-426a-846e-eadd805745a6",
    type: "audio",
    title: "Quick response",
    rating: 4,
    reviewerName: "Lisa Wang",
    bodyText: "The support team responds quickly and the product works exactly as advertised.",
    status: "approved",
    publishedAt: "2025-01-10T13:20:00Z",
    createdAt: "2025-01-10T13:20:00Z",
    updatedAt: "2025-01-10T13:25:00Z",
    media:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: "13cd4d7f-0f97-426a-846e-eadd805745a7",
    type: "video",
    title: "Great value for money",
    rating: 5,
    reviewerName: "David Brown",
    bodyText: "You get so much value for what you pay. This is definitely worth the investment.",
    status: "approved",
    publishedAt: "2025-01-09T15:10:00Z",
    createdAt: "2025-01-09T15:10:00Z",
    updatedAt: "2025-01-09T15:15:00Z",
    media: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    
  },
  {
    id: "13cd4d7f-0f97-426a-846e-eadd805745a8",
    type: "text",
    title: "Outstanding quality",
    rating: 5,
    reviewerName: "Jennifer Lee",
    bodyText: "The quality is exceptional and it's clear that a lot of thought went into the design and functionality.",
    status: "approved",
    publishedAt: "2025-01-08T12:00:00Z",
    createdAt: "2025-01-08T12:00:00Z",
    updatedAt: "2025-01-08T12:05:00Z",
    media: []
  }
];

export const MOCK_GOOGLE_REVIEWS = [
  {
    id: 'google-1',
    type: 'google',
    title: '5 star review',
    rating: 5,
    reviewerName: 'John Smith',
    bodyText: 'Excellent service! The team was professional and delivered exactly what we needed. Highly recommend to anyone looking for quality work.',
    publishedAt: '2024-01-15T10:30:00Z',
    publishedAt: '2024-01-15T10:30:00Z',
    media: []
  },
  {
    id: 'google-2',
    type: 'google', 
    title: '4 star review',
    rating: 4,
    reviewerName: 'Sarah Johnson',
    bodyText: 'Great experience overall. The process was smooth and the results exceeded our expectations. Will definitely use their services again.',
    publishedAt: '2024-01-10T14:20:00Z',
    publishedAt: '2024-01-10T14:20:00Z',
    media: []
  },
  {
    id: 'google-3',
    type: 'google',
    title: '5 star review',
    rating: 5,
    reviewerName: 'Mike Chen',
    bodyText: 'Outstanding customer support and attention to detail. They went above and beyond to ensure we were satisfied with the final product.',
    publishedAt: '2024-01-08T09:15:00Z',
    publishedAt: '2024-01-08T09:15:00Z',
    media: []
  },
  {
    id: 'google-4',
    type: 'google',
    title: '4 star review', 
    rating: 4,
    reviewerName: 'Emily Davis',
    bodyText: 'Professional team with great communication throughout the project. The quality of work was impressive and delivered on time.',
    publishedAt: '2024-01-05T16:45:00Z',
    publishedAt: '2024-01-05T16:45:00Z',
    media: []
  }
];

export const assest = {
  Logo
}