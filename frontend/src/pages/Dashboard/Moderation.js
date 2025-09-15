import {
  DocumentTextIcon,
  TrashIcon,
  VideoCameraIcon,
} from "@heroicons/react/16/solid";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { MOCK_REVIEWS } from "../../assets/mockData";
import toast from "react-hot-toast";
import ReviewPreviewModal from "../../components/ReviewPreviewModal";
import { API_PATHS } from "../../service/apiPaths";
import axiosInstance from "../../service/axiosInstanse";
import { SpeakerWaveIcon } from "@heroicons/react/20/solid";

const Moderation = () => {
  const { tenant } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getReviews = async (tenantId) => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.REVIEWS.GET_REVIEWS(tenantId)
      );
      const data = await response.data;
      setReviews(data);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(reviews);
  
  
  useEffect(() => {
    getReviews(tenant?.id);
  }, []);

  const updateReview = async (id, newStatus) => {
    const updatedReviews = reviews.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    await axiosInstance.patch(
      API_PATHS.REVIEWS.UPDATE_REVIEW(`${id}/${newStatus}`)
    );
    setReviews(updatedReviews);
    getReviews(tenant?.id);
    toast.success(`Review ${id} has been ${newStatus}.`);
    setIsModalOpen(false); // Close modal on action
  };

  const openModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Moderation Dashboard
      </h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-50 p-4 border border-gray-200 justify-between transition-all duration-200 cursor-pointer hover:bg-gray-100"
            onClick={() => openModal(review)}
          >
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              {review.videoId && (
                <VideoCameraIcon
                  src={review.videoId.url}
                  controls
                  className="w-15 h-15 object-cover text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {review.audioId && (
                <SpeakerWaveIcon
                  src={review.audioId.url}
                  controls
                  className="w-15 h-15 object-cover text-orange-400"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {review.text && (
                <div className="  p-2 flex items-center">
                  <p className="text-sm text-gray-500 overflow-hidden text-ellipsis line-clamp-3">
                    <DocumentTextIcon className="w-15 h-15 object-cover text-green-400" />
                  </p>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{review.title}</h3>
                <span
                  className={`text-sm font-medium px-2 py-1 tracking-wide ${
                    review.status === "PENDING"
                      ? "bg-orange-100 text-orange-500"
                      : review.status === "APPROVED"
                      ? "bg-green-100 text-green-600"
                      : review.status === "REJECTED"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {review.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div
              className="flex space-x-2 mt-4 sm:mt-0"
              onClick={(e) => e.stopPropagation()}
            >
              {review.status === "PENDING" && (
                <>
                  <button
                    onClick={() => updateReview(review.id, "APPROVED")}
                    className="bg-green-600 text-white px-2 py-1 font-medium hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateReview(review.id, "REJECTED")}
                    className="bg-red-600 text-white px-2 py-1 font-medium hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              {review.status !== "PENDING" && (
                <button
                  onClick={() => updateReview(review.id, "DELETED")}
                  className="bg-red-600 text-white px-4 py-2 font-medium hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedReview && (
        <ReviewPreviewModal review={selectedReview} onClose={closeModal} />
      )}
    </>
  );
};

export default Moderation;
