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

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="container mx-auto py-6 px-4 md:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <div className="flex justify-center gap-x-6 gap-y-2 flex-wrap mb-4">
          <FooterLink href="#">Home</FooterLink>
          <FooterLink href="#about">About</FooterLink>
          <FooterLink href="#faq">FAQ</FooterLink>
          {/* <FooterLink href="#contact">Contact Us</FooterLink> */}{" "}
          {/* <-- REMOVE THIS */}
          <FooterLink href="#policy">Privacy Policy</FooterLink>
          <FooterLink href="#disclaimer">Disclaimer</FooterLink>
          <FooterLink href="#terms">Terms & Conditions</FooterLink>
        </div>
        <p>&copy; {new Date().getFullYear()} wallpaint. All Rights Reserved.</p>
        <p className="mt-2">
          Powered by Gemini. Built with React & Tailwind CSS.
        </p>
      </div>
    </footer>
  );
};
