import React from "react";

const PricingCard: React.FC<{
  credits: number;
  price: string;
  popular?: boolean;
}> = ({ credits, price, popular }) => (
  <div
    className={`relative p-8 rounded-2xl border-2 flex flex-col items-center transition-transform hover:scale-105 ${
      popular
        ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-xl"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    }`}
  >
    {popular && (
      <span className="absolute -top-4 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
        Best Value
      </span>
    )}
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
      {credits} Credits
    </h3>
    <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 my-6">
      {price}
    </p>
    <ul className="text-gray-600 dark:text-gray-400 space-y-3 mb-8 text-sm">
      <li className="flex items-center gap-2">✓ Photorealistic AI Visuals</li>
      <li className="flex items-center gap-2">✓ No Expiration</li>
      <li className="flex items-center gap-2">✓ Commercial Usage</li>
    </ul>
    <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md">
      Buy Now
    </button>
  </div>
);

export const PricingPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Get More Credits
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Purchase credits to keep visualizing your home. Every visualization
          uses 1 credit to cover AI processing costs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PricingCard credits={15} price="$9.99" />
        <PricingCard credits={30} price="$17.99" popular={true} />
        <PricingCard credits={50} price="$24.99" />
      </div>
    </div>
  );
};
