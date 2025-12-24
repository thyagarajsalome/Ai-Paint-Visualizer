import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

// Define regional pricing configuration
// Define regional pricing configuration
const PRICING_CONFIG = {
  IN: {
    currency: "INR",
    symbol: "₹",
    rates: [
      { credits: 15, amount: 299, popular: false },
      { credits: 30, amount: 499, popular: true }, // Best value
      { credits: 50, amount: 999, popular: false },
    ],
  },
  DEFAULT: {
    currency: "USD",
    symbol: "$",
    rates: [
      { credits: 15, amount: 9.99, popular: false },
      { credits: 30, amount: 14.99, popular: true }, // Adjusted (better scaling)
      { credits: 50, amount: 19.99, popular: false }, // Adjusted
    ],
  },
};

const PricingCard: React.FC<{
  credits: number;
  price: string;
  amount: number;
  currency: string;
  popular?: boolean;
}> = ({ credits, price, amount, currency, popular }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to purchase credits.");
      return;
    }

    setIsProcessing(true);
    try {
      const token = await user.getIdToken();

      // 1. Create Order on Backend
      const orderRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount, currency }),
        }
      );

      const orderData = await orderRes.json();

      if (!orderRes.ok)
        throw new Error(orderData.error || "Failed to create order");

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your .env
        amount: orderData.amount,
        currency: orderData.currency,
        name: "wallpaint",
        description: `Purchase ${credits} Credits`,
        order_id: orderData.id,
        handler: async (response: any) => {
          // 3. Verify Payment on Backend
          const verifyRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/payments/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                creditAmount: credits,
              }),
            }
          );

          if (verifyRes.ok) {
            alert("Payment Successful! Credits added to your account.");
            window.location.hash = ""; // Redirect to home
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
      <button
        onClick={handleBuyNow}
        disabled={isProcessing}
        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md disabled:bg-gray-400"
      >
        {isProcessing ? "Processing..." : "Buy Now"}
      </button>
    </div>
  );
};

export const PricingPage: React.FC = () => {
  const [region, setRegion] = useState<"IN" | "DEFAULT">("DEFAULT");

  useEffect(() => {
    // Detect if user is in India timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone.includes("Calcutta") || timeZone.includes("Asia/Kolkata")) {
      setRegion("IN");
    }
  }, []);

  const config = PRICING_CONFIG[region];

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
        {config.rates.map((tier) => (
          <PricingCard
            key={tier.credits}
            credits={tier.credits}
            amount={tier.amount}
            currency={config.currency}
            price={`${config.symbol}${tier.amount}`}
            popular={tier.popular}
          />
        ))}
      </div>
    </div>
  );
};
