import {
  ChartBarIcon,
  CloudArrowUpIcon,
  MegaphoneIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
} from "@heroicons/react/16/solid";
import FeatureCard from "../../components/FeatureCard";


const Features = () => {
  return (
    <div className="p-8 bg-white border border-gray-200 mt-5">
      <h2 className="max-w-7xl mx-auto px-6 py-12 text-4xl font-extrabold text-gray-800 text-center mb-12">
        Our Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          title="Video Testimonial Capture"
          description="Easily collect high-quality video testimonials directly from your customers via a simple, shareable link."
          icon={<VideoCameraIcon />}
        />
        <FeatureCard
          title="Audio & Text Reviews"
          description="Offer multiple options for your customers to leave feedback, catering to their preferences and comfort levels."
          icon={<MegaphoneIcon />}
        />
        <FeatureCard
          title="Customizable Widgets"
          description="Display your best testimonials beautifully on your website with fully customizable widgets that match your brand."
          icon={<PuzzlePieceIcon />}
        />
        <FeatureCard
          title="Seamless Integrations"
          description="Our platform integrates effortlessly with popular tools like WordPress and Shopify to streamline your workflow."
          icon={<CloudArrowUpIcon />}
        />
        <FeatureCard
          title="Advanced Moderation"
          description="Approve, reject, and manage all your incoming reviews from one centralized and intuitive dashboard."
          icon={<ShieldCheckIcon />}
        />
        <FeatureCard
          title="In-depth Analytics"
          description="Gain valuable insights into your customer feedback with our comprehensive analytics and reporting tools."
          icon={<ChartBarIcon />}
        />
      </div>
    </div>
  );
};

export default Features;
