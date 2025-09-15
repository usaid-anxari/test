// Example of embedding the iframe directly
import { ArrowLeftIcon } from '@heroicons/react/16/solid';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const GoogleEmbed = () => {
    const { user } = useContext(AuthContext);
    const publicReviewBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const businessSlug = user?.publicReviewUrl || "your-business";  
    const publicRecordUrl = `/record/${businessSlug}`;
    const navigate = useNavigate();
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
                {/* Header Section */}
                <button
                    onClick={() => navigate(publicRecordUrl)}
                    className="font-semibold text-indigo-600 flex items-center cursor-pointer"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> go back
                </button>
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-6">
                    </div>
                    <h1 className="text-3xl font-bold text-indigo-600 ">
                        Leave a Review
                    </h1>
                    <p className="mt-2 text-gray-600 ">
                        Your feedback is important to us. Please fill out the form below to share your experience.
                    </p>
                </div>

                {/* The iframe container with professional styling */}
                <div className="overflow-hidden rounded-xl shadow-lg border border-gray-300">
                    <iframe
                        // This is the Google Form embed link. Replace this with your own.
                        src="https://docs.google.com/forms/d/e/1FAIpQLSfv8OwbYMfWwDm24NNSUOMIa4JiqURy00mDjgBMDNOF3_kIZQ/viewform?embedded=true"
                        // Setting width to 100% makes it responsive to the container.
                        width="100%"
                        // A fixed height is often necessary for iframes to prevent content shifting.
                        height="472"
                        // Hiding the border makes it look integrated into the page.
                        frameBorder="0"
                        marginHeight="0"
                        marginWidth="0"
                        title="Google Review Form"
                        aria-label="Google Review Form"
                    >
                        Loading…
                    </iframe>
                </div>
            </div>
        </div>
    );
};

export default GoogleEmbed;