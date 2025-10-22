import React from 'react';

const FaqItem: React.FC<{ question: string, children: React.ReactNode }> = ({ question, children }) => (
    <details className="p-4 rounded-lg bg-gray-50 border group">
        <summary className="font-semibold text-lg text-gray-800 cursor-pointer list-none flex justify-between items-center">
            {question}
            <span className="transform transition-transform duration-200 group-open:rotate-45 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </span>
        </summary>
        <div className="mt-4 text-gray-600 space-y-3 leading-relaxed">
            {children}
        </div>
    </details>
);


export const FaqPage: React.FC = () => {
    return (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
                <FaqItem question="What kind of photos work best?">
                    <p>For the best results, use well-lit, clear photos of your room. Try to capture the walls as directly as possible. Photos with less clutter on the walls tend to produce cleaner visualizations. Natural daylight is ideal for showing the truest color.</p>
                </FaqItem>
                <FaqItem question="Is the color I see on screen exactly what I will get?">
                    <p>No. The visualization is a very close estimate, but screen calibrations and room lighting can affect the color's appearance. We strongly advise getting a physical paint sample to test on your wall before making a final decision. Please see our Disclaimer page for more information.</p>
                </FaqItem>
                <FaqItem question="Why didn't the AI paint my wall correctly?">
                    <p>The AI is highly advanced but can sometimes be confused by complex scenes, unusual lighting, or heavy shadows. If a result isn't perfect, try a different photo of the same room from another angle or with better lighting. Ensure the wall is the main subject of the photo.</p>
                </FaqItem>
                <FaqItem question="Are the images I upload saved?">
                    <p>No. We do not store your images on our servers. Your image is sent to the Google Gemini API for processing and is not retained by us after your session. Your privacy is important to us. Please refer to our Privacy Policy for more details.</p>
                </FaqItem>
                <FaqItem question="Can I use this app on my phone?">
                    <p>Yes! The application is fully responsive and works on desktops, tablets, and mobile phones. As a Progressive Web App (PWA), you can even add it to your phone's home screen for an app-like experience.</p>
                </FaqItem>
            </div>
        </div>
    );
};
