import {
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  VideoCameraIcon,
} from "@heroicons/react/16/solid";
import AnalyticsCard from "../../components/AnalyticsCard";
import { MOCK_REVIEWS } from "../../assets/mockData";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";

const Analytics = () => {
  const { getInitialData, hasFeature, tenant } = useContext(AuthContext);
  const reviews = getInitialData("reviews", MOCK_REVIEWS);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(false);
  const data = {
    videosCollected: reviews.filter((r) => r.type === "video").length,
    audioCollected: reviews.filter((r) => r.type === "audio").length,
    textCollected: reviews.filter((r) => r.type === "text").length,
    widgetViews: Number(localStorage.getItem("widgetViews") || "0"),
    storageUsed: 3.5, // GB, static mock data
    storageLimit: 10, // GB, static mock data
  };
  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          API_PATHS.ANALYTICS.GET_USAGE(tenant?.id)
        );

        setUsage(response?.data);
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
      setLoading(false);
    };
    fetchUsage();
  }, []);
  console.log("Usage Data:", usage);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Active Widgets Count"
          value={usage.activeWidgetsCount || 0}
          icon={<VideoCameraIcon />}
          color="green"
        />
        <AnalyticsCard
          title="Inactive Widgets Count"
          value={usage.inactiveWidgetsCount || 0}
          icon={<MicrophoneIcon />}
          color="red"
        />
        <AnalyticsCard
          title="Reviews Count"
          value={usage.reviewsCount}
          icon={<DocumentTextIcon />}
          color="blue"
        />
        {hasFeature("analytics") && (
          <AnalyticsCard
            title="Total Review Views"
            value={usage.totalReviewViews || 0}
            icon={<ChartBarIcon />}
            color="orange"
          />
        )}
        <AnalyticsCard
          title="Storage Remaining"
          value={`${usage.storageBytes - usage.storageBytes} GB`}
          icon={<CogIcon />}
          color="yellow"
        />
      </div>
    </div>
  );
};
export default Analytics;
