import React from "react";

const PageSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 border-b-2 border-indigo-500 dark:border-indigo-400 pb-2 mb-4">
      {title}
    </h2>
    <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed">
      {children}
    </div>
  </div>
);

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
        Terms & Conditions
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
        Last Updated: {new Date().toLocaleDateString()}
      </p>
      <PageSection title="1. Acceptance of Terms">
        <p>
          By accessing and using wallpaint ("the Service"), you accept and agree
          to be bound by the terms and provision of this agreement. In addition,
          when using this particular service, you shall be subject to any posted
          guidelines or rules applicable to such services. Any participation in
          this service will constitute acceptance of this agreement. If you do
          not agree to abide by the above, please do not use this service.
        </p>
      </PageSection>
      <PageSection title="2. Description of Service">
        <p>
          The Service is an AI-powered tool that allows users to upload images
          of their rooms and visualize them with different paint colors. The
          service is provided for illustrative and estimation purposes only.
        </p>
      </PageSection>
      <PageSection title="3. User Accounts and Credits">
        <p>
          To access the full features of the Service, you may be required to
          sign up for a user account. Upon signing up, you will receive a
          limited number of complimentary "credits". Each visualization you
          generate will consume one or more credits.
        </p>
        <p>
          Once your complimentary credits are exhausted, you will need to
          purchase additional credits to continue using the Service. The pricing
          for credits will be displayed on the purchase page. This credit system
          is necessary to cover the operational costs of our backend
          infrastructure, third-party API usage (e.g., Google Gemini), and user
          authentication services. All payments are final and non-refundable.
        </p>
      </PageSection>
      <PageSection title="4. User Conduct">
        <p>
          You agree not to use the Service to upload any images that are
          illegal, offensive, or infringe on the copyrights of others. We
          reserve the right to terminate accounts that violate this policy.
        </p>
      </PageSection>
      <PageSection title="5. Disclaimer of Warranties">
        <p>
          The service is provided on an "as is" and "as available" basis. We
          make no warranty that the service will meet your requirements or that
          the results will be accurate or reliable. Please refer to our separate
          Disclaimer page for more details on color accuracy.
        </p>
      </PageSection>
      <PageSection title="6. Changes to Terms">
        <p>
          We reserve the right to modify these terms from time to time at our
          sole discretion. Therefore, you should review this page periodically.
          Your continued use of the Service after any such change constitutes
          your acceptance of the new Terms.
        </p>
      </PageSection>
      // Updated sections for src/pages/Terms.tsx
      <PageSection title="3. User Accounts and Credits">
        <p>
          Credits purchased on the Web platform are managed via our web payment
          processor. For mobile users, purchases are processed through the Apple
          App Store In-App Purchase system or Google Play Billing system.
        </p>
        <p>
          <strong>Cross-Platform Access:</strong> Credits are tied to your
          wallpaint account and are accessible across Web, Android, and iOS
          platforms, provided you are logged into the same account.
        </p>
      </PageSection>
      <PageSection title="7. Mobile App Usage">
        <p>
          By using the mobile versions of wallpaint, you also agree to be bound
          by the Apple App Store Terms of Service and/or the Google Play Terms
          of Service, as applicable.
        </p>
      </PageSection>
    </div>
  );
};
