// src/components/Footer.tsx
import React from "react";

const FooterLink: React.FC<{
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
}> = ({ href, children, isExternal }) => (
  <a
    href={href}
    target={isExternal ? "_blank" : undefined}
    rel={isExternal ? "noopener noreferrer" : undefined}
    className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 px-2 py-1 text-sm md:text-base"
  >
    {children}
  </a>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-auto">
      <div className="container mx-auto py-10 px-4">
        {/* Existing Navigation Links */}
        <div className="flex justify-center gap-x-6 gap-y-4 flex-wrap mb-8 max-w-3xl mx-auto text-center">
          <FooterLink href="#">Home</FooterLink>
          <FooterLink href="#about">About</FooterLink>
          <FooterLink href="#faq">FAQ</FooterLink>
          <FooterLink href="#policy">Privacy Policy</FooterLink>
          <FooterLink href="#disclaimer">Disclaimer</FooterLink>
          <FooterLink href="#terms">Terms</FooterLink>
        </div>

        {/* New Explore More Section */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-8 max-w-2xl mx-auto text-center">
          <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
            Explore More
          </h4>
          <div className="flex justify-center gap-x-8 gap-y-4 flex-wrap">
            <FooterLink href="https://ai-wallpaint-ld.vercel.app/" isExternal>
              How to use
            </FooterLink>
            <FooterLink href="https://aihomedecorator.com/" isExternal>
              AI Home Decorator
            </FooterLink>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-700/50 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} wallpaint. AI-Powered Interior Design.
          </p>
        </div>
      </div>
    </footer>
  );
};
