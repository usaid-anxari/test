import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/16/solid";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Customer Success",
    "Marketing",
    "Product Updates",
    "Case Studies",
    "Tips & Tricks",
    "Industry News",
  ];

  const featuredPost = {
    id: 1,
    title: "How to Increase Customer Trust with Video Testimonials",
    excerpt: "Discover the power of video testimonials and learn proven strategies to collect, showcase, and leverage authentic customer stories to build trust and drive conversions.",
    author: "Sarah Johnson",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Customer Success",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    views: 1247,
    comments: 23,
    featured: true,
  };

  const blogPosts = [
    {
      id: 2,
      title: "10 Proven Ways to Collect More Customer Reviews",
      excerpt: "Learn the most effective strategies for encouraging your customers to leave reviews and testimonials that will help grow your business.",
      author: "Michael Chen",
      date: "March 12, 2024",
      readTime: "6 min read",
      category: "Tips & Tricks",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      views: 892,
      comments: 15,
    },
    {
      id: 3,
      title: "The Psychology Behind Customer Testimonials",
      excerpt: "Understanding why testimonials work and how to use psychological principles to make your customer reviews more compelling.",
      author: "Emily Rodriguez",
      date: "March 10, 2024",
      readTime: "7 min read",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop",
      views: 756,
      comments: 12,
    },
    {
      id: 4,
      title: "New Feature: Advanced Analytics Dashboard",
      excerpt: "We've launched our most powerful analytics dashboard yet. Track review performance, customer sentiment, and conversion impact like never before.",
      author: "David Kim",
      date: "March 8, 2024",
      readTime: "4 min read",
      category: "Product Updates",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      views: 634,
      comments: 8,
    },
    {
      id: 5,
      title: "Case Study: How TechCorp Increased Sales by 40%",
      excerpt: "See how TechCorp used TrueTestify to collect and display customer testimonials, resulting in a 40% increase in sales conversions.",
      author: "Sarah Johnson",
      date: "March 5, 2024",
      readTime: "9 min read",
      category: "Case Studies",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      views: 1123,
      comments: 31,
    },
    {
      id: 6,
      title: "The Future of Customer Reviews: AI-Powered Insights",
      excerpt: "Explore how artificial intelligence is revolutionizing the way businesses collect, analyze, and leverage customer feedback.",
      author: "Michael Chen",
      date: "March 3, 2024",
      readTime: "10 min read",
      category: "Industry News",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop",
      views: 445,
      comments: 6,
    },
    {
      id: 7,
      title: "Building Trust in E-commerce: A Complete Guide",
      excerpt: "Comprehensive strategies for e-commerce businesses to build customer trust through testimonials, reviews, and social proof.",
      author: "Emily Rodriguez",
      date: "March 1, 2024",
      readTime: "12 min read",
      category: "Customer Success",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      views: 678,
      comments: 19,
    },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularTags = [
    "Testimonials", "Customer Success", "Marketing", "Trust", "Reviews", 
    "Conversion", "E-commerce", "Video", "Analytics", "Case Study"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              TrueTestify Blog
          </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Insights, tips, and strategies to help you build trust and grow your business through authentic customer testimonials.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Article</h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {featuredPost.category}
              </span>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <CalendarIcon className="h-4 w-4" />
                    {featuredPost.date}
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {featuredPost.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {featuredPost.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      {featuredPost.comments}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    to={`/blog/${featuredPost.id}`}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    Read Article
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                    <BookmarkIcon className="h-5 w-5" />
                  </button>
                  <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                    <ShareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={post.image}
                alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {post.category}
                    </span>
                  </div>
                </div>
              <div className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {post.title}
                </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <UserIcon className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {post.views}
                      </div>
                  <div className="flex items-center gap-1">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        {post.comments}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/blog/${post.id}`}
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 flex items-center gap-1"
                    >
                      Read More
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <BookmarkIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <ShareIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
              </div>
            </div>

        {/* Popular Tags */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Tags</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {popularTags.map((tag) => (
              <button
                key={tag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2"
              >
                <TagIcon className="h-4 w-4" />
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Get the latest insights on customer testimonials, marketing strategies, and product updates delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
