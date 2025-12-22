import React from "react";

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a
    href={href}
    className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
  >
    {children}
  </a>
);

// src/components/Footer.tsx updates
export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="flex justify-center gap-x-8 gap-y-5 flex-wrap mb-6 max-w-2xl mx-auto">
          {/* Increased gap-y-5 for better touch targets on mobile */}
          <FooterLink href="#">Home</FooterLink>
          <FooterLink href="#about">About</FooterLink>
          <FooterLink href="#faq">FAQ</FooterLink>
          <FooterLink href="#policy">Privacy Policy</FooterLink>
          <FooterLink href="#disclaimer">Disclaimer</FooterLink>
          <FooterLink href="#terms">Terms</FooterLink>
        </div>
        {/* ... copyright remains same ... */}
      </div>
    </footer>
  );
};
