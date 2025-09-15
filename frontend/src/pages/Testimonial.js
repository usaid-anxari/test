import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { MOCK_REVIEWS } from '../assets/mockData';
import ReviewCard from '../components/ReviewCard';
import { Link } from 'react-router-dom';

const Testimonial = () => {
  const { getInitialData } = useContext(AuthContext);
  const [layout, setLayout] = useState("grid");
  const [reviews, setReviews] = useState(
    getInitialData("reviews", MOCK_REVIEWS)
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setReviews(getInitialData("reviews", MOCK_REVIEWS));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  });

  const approvedReviews = reviews.filter((r) => r.status === 'approved');

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg mt-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        {/* UPDATED: Display the businessName from the URL */}
        <h2 className="text-4xl font-bold text-blue-600">
           Customer Testimonials
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLayout("grid")}
            className={`px-4 py-2  font-semibold ${
              layout === "grid"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setLayout("carousel")}
            className={`px-4 py-2  font-semibold ${
              layout === "carousel"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Carousel
          </button>
          <button
            onClick={() => setLayout("wall")}
            className={`px-4 py-2 font-medium transition-colors ${
              layout === "wall"
                ?  "bg-orange-500 text-white"
                :  "bg-gray-200 text-gray-700"
            }`}
          >
            Wall
          </button>
          <button
            onClick={() => setLayout("spotlight")}
            className={`px-4 py-2  font-semibold ${
              layout === "spotlight"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Spotlight
          </button>

        </div>
      </div>

      {layout === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
      {layout === "carousel" && (
        <div className="overflow-x-auto flex space-x-6 pb-4">
          {approvedReviews.map((review) => (
            <div key={review.id} className="min-w-[300px] max-w-[300px]">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}
      {layout === "spotlight" && approvedReviews.length > 0 && (
        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Featured Testimonial
          </h3>
          <ReviewCard review={approvedReviews[0]} />
        </div>
      )}
      {layout === "wall" && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {approvedReviews.map((review) => (
            <div key={review.id} className="mb-6 break-inside-avoid">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Link
          to={`/record/${(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).publicReviewUrl : 'your-business') || 'your-business'}`}
          className="inline-block px-6 py-3 bg-orange-500 text-white font-bold  hover:bg-orange-600 transition-colors"
        >
          Leave Your Own Review!
        </Link>
      </div>
    </div>
  );
};
export default Testimonial