import React from "react";

const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
      {title}
    </h2>
    <div className="text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
      {children}
    </div>
  </div>
);

export const PolicyPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
        Privacy Policy
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <PolicySection title="Introduction">
        <p>
          Welcome to wallpaint. We are committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our application across all
          supported platforms.
        </p>
      </PolicySection>

      <PolicySection title="Information We Collect">
        <p>
          We may collect information about you in a variety of ways. The
          information we may collect via the Application includes:
        </p>
        <ul className="list-disc list-inside pl-4">
          <li>
            <strong>Image Data:</strong> We collect the images you voluntarily
            upload for the purpose of paint color visualization. These images
            are sent to a third-party API (Google Gemini) for processing.
          </li>
          <li>
            <strong>Usage Data:</strong> We may automatically collect anonymous
            information about your device and how you use the application, such
            as your IP address, browser type, and operating system for analytics
            purposes.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Use of Your Information">
        <p>
          Having accurate information permits us to provide you with a smooth,
          efficient, and customized experience. Specifically, we may use
          information collected about you via the Application to:
        </p>
        <ul className="list-disc list-inside pl-4">
          <li>
            Process your uploaded images to generate paint visualizations.
          </li>
          <li>
            Monitor and analyze usage and trends to improve your experience with
            the Application.
          </li>
          <li>
            Troubleshoot problems and protect against fraudulent activity.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Data Retention and Deletion">
        <p>
          <strong>Image Processing:</strong> The images you upload are sent to
          the Google Gemini API for processing. We do not store your images on
          our servers. According to Google's API policies, data sent to the API
          is not used to train their models without explicit consent. We do not
          retain your images after the visualization is complete.
        </p>
        <p>
          <strong>Account Deletion:</strong> Users have the right to delete
          their account and associated data (including email and credit balance)
          at any time. You may initiate account deletion directly through the
          settings menu in the wallpaint application or by contacting us at
          support@wallpaint.in. Requests via email will be processed within 7
          business days.
        </p>
      </PolicySection>

      <PolicySection title="Cross-Platform Coverage">
        <p>
          This policy applies to all platforms utilizing the wallpaint backend,
          including our web application, official Android application (Google
          Play), and iOS application (Apple App Store).
        </p>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>
          If you have questions or comments about this Privacy Policy, please
          contact us through the information provided on our Contact page or
          email us at support@wallpaint.in.
        </p>
      </PolicySection>
    </div>
  );
};
