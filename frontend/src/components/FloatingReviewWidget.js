import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AnimatePresence,motion } from "framer-motion";
import { ChatBubbleBottomCenterTextIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { MOCK_REVIEWS } from "../assets/mockData";
import { useLocation } from "react-router-dom";


const FloatingReviewWidget = () => {
    const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const {getInitialData, hasFeature} = useContext(AuthContext)
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const modalRef = useRef();

  useEffect(() => {
    const allReviews = getInitialData('reviews', MOCK_REVIEWS);
    const approved = allReviews.filter(r => r.status === 'approved');
    setReviews(approved);

    const handleStorageChange = () => {
      const updatedReviews = getInitialData('reviews', MOCK_REVIEWS);
      const updatedApproved = updatedReviews.filter(r => r.status === 'approved');
      setReviews(updatedApproved);
    };
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  const toggleModal = () => setIsOpen(!isOpen);

  if (!hasFeature('widget_embed')) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white border border-gray-200 p-4 sm:p-5 shadow-2xl w-[90vw] max-w-md max-h-[70vh] flex flex-col overflow-hidden mb-3 sm:mb-4"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-800">Customer Testimonials</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="bg-gray-100 p-4 border border-gray-200 transition-shadow duration-200 hover:shadow-sm">
                    {review.type === 'video' && <video src={review.dataUrl || review.url} controls className="w-full h-auto object-cover mb-3" />}
                    {review.type === 'audio' && (
                      <div className="flex items-center justify-center p-2 bg-gray-200">
                        <audio src={review.dataUrl || review.url} controls className="w-full" />
                        
                      </div>
                    )}
                    {review.type === 'text' && (
                      <p className="text-gray-700 text-sm italic">"{review.content}"</p>
                    )}
                    <h4 className="font-semibold text-sm mt-3">{review.title}</h4>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No approved reviews yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={toggleModal}
        className="bg-orange-500 text-white border-2 border-orange-500 rounded-full p-3 sm:p-4 shadow-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

const FloatingButton = () => (
  <button
    className="fixed bottom-8 right-8 p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
    title="Leave a Testimonial"
  >
    
  </button>
);

export default FloatingReviewWidget;