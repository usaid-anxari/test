import {
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  EyeIcon,
  TrendingUpIcon,
  ClockIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CursorArrowRaysIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/16/solid";
import AnalyticsCard from "../../components/AnalyticsCard";
import { MOCK_REVIEWS } from "../../assets/mockData";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useStorageStatus } from "../../hooks/useFeatureAccess";

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const { storageStatus } = useStorageStatus();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [widgetAnalytics, setWidgetAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  
  // Fetch business and analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch business profile and reviews
        const businessResponse = await axiosInstance.get(API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE);
        setBusiness(businessResponse.data.business);
        setReviews(businessResponse.data.reviews || []);
        
        // Fetch analytics and widgets if business exists
        if (businessResponse.data.business?.id) {
          try {
            // Fetch dashboard analytics
            const analyticsResponse = await axiosInstance.get(API_PATHS.ANALYTICS.GET_DASHBOARD);
            setAnalytics(analyticsResponse.data);
            
            // Fetch widgets
            const widgetsResponse = await axiosInstance.get(API_PATHS.WIDGETS.GET_WIDGETS);
            setWidgets(widgetsResponse.data);
            
            // Fetch widget performance data
            const widgetPerformance = await Promise.all(
              widgetsResponse.data.map(async (widget) => {
                try {
                  const perfResponse = await axiosInstance.get(API_PATHS.ANALYTICS.GET_WIDGET_PERFORMANCE(widget.id));
                  return { ...widget, performance: perfResponse.data };
                } catch (error) {
                  console.log(`Widget ${widget.id} analytics not available:`, error);
                  return { 
                    ...widget, 
                    performance: { 
                      views: 0, 
                      clicks: 0, 
                      conversions: 0, 
                      conversionRate: 0 
                    } 
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
              topPerformingWidgets: []
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

    if (user) {
      fetchData();
    }
  }, [user]);

  // Calculate metrics from actual data
  const data = {
    videosCollected: reviews.filter((r) => r.type === "video").length,
    audioCollected: reviews.filter((r) => r.type === "audio").length,
    textCollected: reviews.filter((r) => r.type === "text").length,
    widgetViews: analytics?.totalViews || 0,
    widgetClicks: analytics?.totalClicks || 0,
    totalSubmissions: analytics?.totalSubmissions || 0,
    storageUsed: storageStatus?.storageUsageGb || 0,
    storageLimit: storageStatus?.storageLimitGb || 1,
    activeWidgets: widgets.filter(w => w.isActive).length,
  };

  // Mock trend data for charts (will be replaced with real data later)
  const trendData = {
    reviews: [12, 19, 15, 25, 22, 30, 28],
    views: [150, 230, 180, 320, 290, 410, 380],
    engagement: [65, 72, 68, 78, 75, 82, 79]
  };

  const totalReviews = data.videosCollected + data.audioCollected + data.textCollected;
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1) : '0.0';
  const storagePercentage = data.storageLimit > 0 ? ((data.storageUsed / data.storageLimit) * 100).toFixed(1) : '0';

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

  const MetricCard = ({ title, value, change, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          <div className={`w-6 h-6 text-${color}-600`}>{icon}</div>
        </div>
        {change && (
          <div className={`flex items-center text-sm font-semibold ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </div>
      {trend && (
        <div className="flex items-center space-x-1">
          {trend.map((point, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded bg-${color}-200`}
              style={{ opacity: 0.3 + (point / 100) * 0.7 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );

  const ChartCard = ({ title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Business Analytics
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Track your review performance and engagement metrics
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="flex space-x-2">
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      timeRange === range
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Reviews"
            value={totalReviews}
            change={12.5}
            icon={<DocumentTextIcon />}
            color="blue"
            trend={trendData.reviews}
          />
          <MetricCard
            title="Widget Views"
            value={data.widgetViews.toLocaleString()}
            change={8.3}
            icon={<EyeIcon />}
            color="green"
            trend={trendData.views}
          />
          <MetricCard
            title="Average Rating"
            value={avgRating}
            change={2.1}
            icon={<StarIcon />}
            color="orange"
            trend={trendData.engagement}
          />
          <MetricCard
            title="Widget Clicks"
            value={data.widgetClicks.toLocaleString()}
            change={15.7}
            icon={<CursorArrowRaysIcon />}
            color="purple"
          />
        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
          >
            <div className="p-3 rounded-xl bg-blue-50 w-fit mx-auto mb-3">
              <PresentationChartLineIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{data.activeWidgets}</div>
            <div className="text-sm text-gray-500">Active Widgets</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
          >
            <div className="p-3 rounded-xl bg-red-50 w-fit mx-auto mb-3">
              <ClockIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{reviews.filter(r => r.status === 'pending').length}</div>
            <div className="text-sm text-gray-500">Pending Reviews</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
          >
            <div className="p-3 rounded-xl bg-green-50 w-fit mx-auto mb-3">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{data.totalSubmissions}</div>
            <div className="text-sm text-gray-500">Submissions</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
          >
            <div className="p-3 rounded-xl bg-orange-50 w-fit mx-auto mb-3">
              <CogIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{data.storageUsed}GB</div>
            <div className="text-sm text-gray-500">Storage Used</div>
          </motion.div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Review Types Distribution */}
          <ChartCard title="Review Types Distribution">
            <div className="space-y-4">
              {[
                { type: 'Video Reviews', count: data.videosCollected, color: 'bg-orange-500', icon: <VideoCameraIcon className="w-5 h-5" /> },
                { type: 'Audio Reviews', count: data.audioCollected, color: 'bg-purple-500', icon: <MicrophoneIcon className="w-5 h-5" /> },
                { type: 'Text Reviews', count: data.textCollected, color: 'bg-green-500', icon: <DocumentTextIcon className="w-5 h-5" /> }
              ].map((item) => {
                const percentage = totalReviews > 0 ? (item.count / totalReviews * 100).toFixed(1) : 0;
                return (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${item.color.replace('bg-', 'bg-').replace('-500', '-100')} text-${item.color.split('-')[1]}-600`}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-700">{item.type}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 w-12">{item.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Widget Performance */}
          <ChartCard title="Widget Performance">
            <div className="space-y-4">
              {widgetAnalytics.length > 0 ? (
                widgetAnalytics.slice(0, 4).map((widget) => {
                  const conversionRate = widget.performance?.conversionRate || 0;
                  return (
                    <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <PresentationChartLineIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{widget.name}</div>
                          <div className="text-sm text-gray-500">{widget.type} widget</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{widget.performance?.views || 0}</div>
                          <div className="text-gray-500">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{widget.performance?.clicks || 0}</div>
                          <div className="text-gray-500">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">{conversionRate.toFixed(1)}%</div>
                          <div className="text-gray-500">CVR</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PresentationChartLineIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No widget data available yet</p>
                  <p className="text-sm">Create widgets to see performance metrics</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Recent Activity & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      review.type === 'video' ? 'bg-orange-100 text-orange-600' :
                      review.type === 'audio' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {review.type === 'video' ? <VideoCameraIcon className="w-4 h-4" /> :
                       review.type === 'audio' ? <MicrophoneIcon className="w-4 h-4" /> :
                       <DocumentTextIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{review.reviewerName}</div>
                      <div className="text-sm text-gray-500">{review.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{avgRating}/5.0</div>
                <div className="text-sm opacity-90">Average Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{((data.widgetViews / totalReviews) || 0).toFixed(1)}</div>
                <div className="text-sm opacity-90">Views per Review</div>
              </div>
              <div className={`backdrop-blur-sm rounded-xl p-4 ${
                storageStatus?.isExceeded ? 'bg-red-500/20' : 
                storageStatus?.usagePercentage > 80 ? 'bg-orange-500/20' : 'bg-white/10'
              }`}>
                <div className="text-2xl font-bold">{(data.storageLimit - data.storageUsed).toFixed(1)}GB</div>
                <div className="text-sm opacity-90">
                  {storageStatus?.isExceeded ? 'Over Limit!' : 'Storage Remaining'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
