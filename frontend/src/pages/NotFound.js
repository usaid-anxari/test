import { ExclamationCircleIcon } from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-gray-50">
    <ExclamationCircleIcon className="h-24 w-24 text-orange-500 mb-4" />
    <h1 className="text-5xl font-extrabold text-gray-800 mb-2">
      404 - Page Not Found
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      Oops! The page you are looking for does not exist.
    </p>
    <Link
      to="/"
      className="px-8 py-3 bg-blue-600 text-white font-bold tracking-wide transition-colors hover:bg-blue-700"
    >
      Go to Homepage
    </Link>
  </div>
);

export default NotFound;
