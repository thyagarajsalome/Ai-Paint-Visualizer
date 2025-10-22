import React from 'react';

const FooterLink: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="text-gray-500 hover:text-indigo-600 transition-colors duration-200">
        {children}
    </a>
);

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t">
            <div className="container mx-auto py-6 px-4 md:px-8 text-center text-gray-500 text-sm">
                <div className="flex justify-center gap-x-6 gap-y-2 flex-wrap mb-4">
                    <FooterLink href="#">Home</FooterLink>
                    <FooterLink href="#about">About</FooterLink>
                    <FooterLink href="#faq">FAQ</FooterLink>
                    <FooterLink href="#contact">Contact Us</FooterLink>
                    <FooterLink href="#policy">Privacy Policy</FooterLink>
                    <FooterLink href="#disclaimer">Disclaimer</FooterLink>
                </div>
                <p>&copy; {new Date().getFullYear()} AI Paint Visualizer. All Rights Reserved.</p>
                <p className="mt-2">Powered by Gemini. Built with React & Tailwind CSS.</p>
            </div>
        </footer>
    );
};
