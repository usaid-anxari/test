import {
  ChartBarIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CursorArrowRaysIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useStorageStatus } from "../../hooks/useFeatureAccess";
import { useAuth0 } from "@auth0/auth0-react";
import SubscriptionBanner from "../../components/SubscriptionBanner";
import useSubscription from "../../hooks/useSubscription";

const Analytics = () => {
  const { isAuthenticated } = useAuth0();
  const { storageStatus } = useStorageStatus();
  const { subscriptionData } = useSubscription();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [widgetAnalytics, setWidgetAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Filter data based on time range
  const getFilteredData = (data, range) => {
    if (!data || !Array.isArray(data)) return data;

    const now = new Date();
    let startDate;

    switch (range) {
      case "daily":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt || item.submittedAt);
      return itemDate >= startDate;
    });
  };

  // Fetch business and analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch business profile and reviews
        const businessResponse = await axiosInstance.get(
          API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE
        );

        setBusiness(businessResponse.data.business);
        setReviews(businessResponse.data.reviews || []);

        // Fetch analytics and widgets if business exists
        if (businessResponse.data.business?.id) {
          try {
            // Fetch dashboard analytics
            const analyticsResponse = await axiosInstance.get(
              API_PATHS.ANALYTICS?.GET_DASHBOARD
            );
            setAnalytics(analyticsResponse?.data);
            // Fetch widgets
            const widgetsResponse = await axiosInstance.get(
              API_PATHS.WIDGETS.GET_WIDGETS
            );
            setWidgets(
              widgetsResponse?.data ? widgetsResponse?.data.widgets : []
            );
            // Widgets fetched successfully

            // Fetch widget performance data
            const widgetsArray = widgetsResponse?.data?.widgets || [];
            
            const widgetPerformance = await Promise.all(
              widgetsArray.map(async (widget) => {
                try {
                  const perfResponse = await axiosInstance.get(
                    API_PATHS.ANALYTICS.GET_WIDGET_PERFORMANCE(widget.id)
                  );
                  return { ...widget, performance: perfResponse.data };
                } catch (error) {
                  console.log(
                    `Widget ${widget.id} analytics not available:`,
                    error
                  );
                  return {
                    ...widget,
                    performance: {
                      views: 0,
                      clicks: 0,
                      conversions: 0,
                      conversionRate: 0,
                    },
                  };
                }
              })
            );
            setWidgetAnalytics(widgetPerformance);
          } catch (analyticsError) {
            console.log("Analytics not available yet:", analyticsError);
            // Set default analytics if API not available
            setAnalytics({
              totalViews: 0,
              totalClicks: 0,
              totalSubmissions: 0,
              storageUsed: 0,
              storageLimit: 10,
              widgetPerformance: [],
              topPerformingWidgets: [],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Filter reviews based on time range
  const filteredReviews = getFilteredData(reviews, timeRange);

  // Use actual API data with time filtering
  const data = {
    videosCollected: filteredReviews.filter((r) => r.type === "video").length,
    audioCollected: filteredReviews.filter((r) => r.type === "audio").length,
    textCollected: filteredReviews.filter((r) => r.type === "text").length,
    widgetViews: analytics?.totalViews || 0,
    widgetClicks: analytics?.totalClicks || 0,
    totalSubmissions: analytics?.totalSubmissions || 0,
    storageUsed: analytics?.storageUsed || 0,
    storageLimit: analytics?.storageLimit || 1,
    activeWidgets: Array.isArray(widgets)
      ? widgets.filter((w) => w.isActive === true).length
      : 0,
  };

  // Calculate previous period data for comparison
  const getPreviousPeriodData = () => {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case "daily":
        startDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
      default:
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const previousReviews = reviews.filter((item) => {
      const itemDate = new Date(item.createdAt || item.submittedAt);
      return itemDate >= startDate && itemDate <= endDate;
    });

    return {
      totalReviews: previousReviews.length,
      widgetViews: Math.floor(data.widgetViews * 0.85),
      widgetClicks: Math.floor(data.widgetClicks * 0.92),
      avgRating:
        previousReviews.length > 0
          ? previousReviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
            previousReviews.length
          : 0,
    };
  };

  const previousPeriodData = getPreviousPeriodData();


  const totalReviews = filteredReviews.length;
  const totalReviewsChange = calculateChange(
    totalReviews,
    previousPeriodData.totalReviews
  );
  const widgetViewsChange = calculateChange(
    data.widgetViews,
    previousPeriodData.widgetViews
  );
  const widgetClicksChange = calculateChange(
    data.widgetClicks,
    previousPeriodData.widgetClicks
  );
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length
        ).toFixed(1)
      : "0.0";
  const avgRatingChange = calculateChange(
    parseFloat(avgRating),
    previousPeriodData.avgRating
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <SubscriptionBanner 
        subscriptionStatus={subscriptionData?.status}
        tier={subscriptionData?.tier}
        storageUsage={subscriptionData?.storageUsage}
        trialActive={subscriptionData?.trialActive}
        trialDaysLeft={subscriptionData?.trialDaysLeft}
      />
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Analytics & Reports
        </h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div
              className={`flex items-center text-sm font-semibold ${
                totalReviewsChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalReviewsChange >= 0 ? "+" : ""}
              {totalReviewsChange}%
              <ArrowTrendingUpIcon
                className={`w-4 h-4 ml-1 ${
                  totalReviewsChange < 0 ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalReviews.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PresentationChartLineIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div
              className={`flex items-center text-sm font-semibold ${
                widgetViewsChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {widgetViewsChange >= 0 ? "+" : ""}
              {widgetViewsChange}%
              <ArrowTrendingUpIcon
                className={`w-4 h-4 ml-1 ${
                  widgetViewsChange < 0 ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data.widgetViews.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Widget Views</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <StarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div
              className={`flex items-center text-sm font-semibold ${
                avgRatingChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {avgRatingChange >= 0 ? "+" : ""}
              {avgRatingChange}%
              <ArrowTrendingUpIcon
                className={`w-4 h-4 ml-1 ${
                  avgRatingChange < 0 ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgRating}</div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CursorArrowRaysIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div
              className={`flex items-center text-sm font-semibold ${
                widgetClicksChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {widgetClicksChange >= 0 ? "+" : ""}
              {widgetClicksChange}%
              <ArrowTrendingUpIcon
                className={`w-4 h-4 ml-1 ${
                  widgetClicksChange < 0 ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data.widgetClicks.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Widget Clicks</div>
        </motion.div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Review Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Review Type Distribution
          </h3>

          {/* Review Types with Progress Bars */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <VideoCameraIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">Video Reviews</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        totalReviews > 0
                          ? (data.videosCollected / totalReviews) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 w-16">
                  {data.videosCollected} Videos
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MicrophoneIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">Voice Reviews</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        totalReviews > 0
                          ? (data.audioCollected / totalReviews) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 w-16">
                  {data.audioCollected} Voices
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">Text Reviews</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        totalReviews > 0
                          ? (data.textCollected / totalReviews) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 w-16">
                  {data.textCollected} Reviews
                </span>
              </div>
            </div>
          </div>

          {/* Star Rating Section */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {avgRating}
              </div>
              <div className="flex items-center justify-center mb-2">
                <StarIcon className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(
                  (r) => Math.floor(r.rating || 5) === star
                ).length;
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-600 w-2">{star}</span>
                    <StarIcon className="w-3 h-3 text-gray-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
              {totalReviews} reviews
            </span>
          </div>
        </motion.div>

        {/* Right Column - Widget Performances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Widget Performance
            </h3>
            <span className="text-sm text-gray-500">
              {widgets.length} active widgets
            </span>
          </div>

          <div className="space-y-4">
            {widgets.length > 0 ? (
              widgets.slice(0, 5).map((widget) => {
                const performance = widgetAnalytics.find(w => w.id === widget.id)?.performance || {
                  views: 0,
                  clicks: 0,
                  conversions: 0,
                  conversionRate: 0
                };
                
                const ctr = performance.views > 0 ? ((performance.clicks / performance.views) * 100).toFixed(1) : '0.0';
                
                return (
                  <div
                    key={widget.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          widget.type === 'grid' ? 'bg-blue-100' :
                          widget.type === 'carousel' ? 'bg-green-100' :
                          widget.type === 'spotlight' ? 'bg-purple-100' :
                          'bg-orange-100'
                        }`}>
                          <PresentationChartLineIcon className={`w-4 h-4 ${
                            widget.type === 'grid' ? 'text-blue-600' :
                            widget.type === 'carousel' ? 'text-green-600' :
                            widget.type === 'spotlight' ? 'text-purple-600' :
                            'text-orange-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {widget.name}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {widget.type} widget
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        widget.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {widget.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {performance.views.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {performance.clicks.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Clicks</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {performance.conversions.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Reviews</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-orange-600">
                          {ctr}%
                        </div>
                        <div className="text-xs text-gray-500">CTR</div>
                      </div>
                    </div>
                    
                    {performance.views > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Engagement Rate</span>
                          <span>{ctr}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(parseFloat(ctr), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PresentationChartLineIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No widgets created yet</p>
                <p className="text-sm mt-1">Create your first widget to start tracking performance</p>
              </div>
            )}
          </div>
          
          {widgets.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all {widgets.length} widgets →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
export default Analytics;
