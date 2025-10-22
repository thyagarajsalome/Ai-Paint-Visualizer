import React from 'react';

const DisclaimerSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h2>
        <div className="text-gray-600 space-y-3 leading-relaxed">
            {children}
        </div>
    </div>
);


export const DisclaimerPage: React.FC = () => {
    return (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Disclaimer</h1>

            <DisclaimerSection title="For Entertainment & Estimation Purposes Only">
                <p>
                    The AI Paint Visualizer is provided as a tool to help you explore and estimate how different paint colors might look in your space. The visualizations generated are for illustrative and entertainment purposes only and should not be considered a perfectly accurate representation of the final result.
                </p>
            </DisclaimerSection>

            <DisclaimerSection title="Color Accuracy">
                <p>
                    The appearance of paint colors can vary significantly based on a number of factors, including:
                </p>
                 <ul className="list-disc list-inside pl-4">
                    <li>The lighting conditions in your room (natural vs. artificial, time of day).</li>
                    <li>The quality and color calibration of your computer monitor or mobile device screen.</li>
                    <li>The texture and material of the wall surface.</li>
                    <li>The type of paint finish (e.g., matte, eggshell, satin, semi-gloss).</li>
                </ul>
                 <p>
                    We strongly recommend that you obtain physical paint samples from the manufacturer and test them directly on your walls before making a final purchasing decision. <strong>Do not rely solely on the digital visualization provided by this tool.</strong>
                </p>
            </DisclaimerSection>

            <DisclaimerSection title="Limitation of Liability">
                 <p>
                    The developers of AI Paint Visualizer shall not be held liable for any decisions made based on the use of this application, including but not limited to the purchase of paint or other materials. By using this service, you agree that you are fully responsible for your color choices and any outcomes that result.
                </p>
            </DisclaimerSection>
        </div>
    );
};
