'use client';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-700 dark:text-gray-400">{description}</p>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: "",
      title: "Easy Tenant Search",
      description: "Quickly connect with suitable tenants and save time."
    },
    {
      icon: "📱",
      title: "24/7 Support",
      description: "Our support team is always ready to help with any questions."
    },
    {
      icon: "📊",
      title: "Listing Management",
      description: "Easily manage and track the performance of your listings."
    },
    {
      icon: "💼",
      title: "Competitive Pricing",
      description: "Affordable rates suitable for all users."
    }
  ];

  return (
    <div className="py-12 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            WHY CHOOSE US?
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
