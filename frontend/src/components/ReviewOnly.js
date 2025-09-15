import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ExclamationCircleIcon } from "@heroicons/react/16/solid";

const ReviewerOnly = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border border-gray-200 shadow-sm text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Hello, {user?.id}!</h2>
      <p className="text-gray-600 text-lg mb-8">
        Thanks for signing up as a reviewer! You can now use your unique link from the business to submit a testimonial.
      </p>
      <div className="inline-flex items-center p-4 bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500">
        <ExclamationCircleIcon className="h-6 w-6 mr-2" />
        <p className="font-medium">
          If you were meant to be a business owner, please log out and sign up again as an Admin.
        </p>
      </div>
    </div>
  );
};

export default ReviewerOnly