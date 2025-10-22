import React from 'react';

const PageSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-4">{title}</h2>
        <div className="text-gray-600 space-y-4 leading-relaxed">
            {children}
        </div>
    </div>
);

export const AboutPage: React.FC = () => {
    return (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center">About AI Paint Visualizer</h1>
            
            <PageSection title="Our Mission">
                <p>
                    Choosing the right paint color can be daunting. Swatches look different on a screen versus on a wall, and it's hard to imagine how a color will truly transform a space. Our mission is to eliminate the guesswork. The AI Paint Visualizer was created to empower homeowners, designers, and DIY enthusiasts to make confident color decisions by seeing the results before a single can of paint is opened.
                </p>
            </PageSection>

            <PageSection title="How It Works">
                <p>
                    This application leverages the power of Google's advanced Gemini model, a cutting-edge generative AI. When you upload a photo of your room, here’s what happens behind the scenes:
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li><strong>Image Analysis:</strong> The AI carefully analyzes your photo to identify the structural walls, distinguishing them from furniture, trim, ceilings, and other objects.</li>
                    <li><strong>Color Application:</strong> It then digitally repaints the identified wall surfaces with your selected color.</li>
                    <li><strong>Realistic Rendering:</strong> Crucially, the AI preserves the original lighting, shadows, and textures of your room. This ensures the final visualization looks incredibly realistic, not like a flat cartoon. It understands how light interacts with surfaces to give you an authentic preview.</li>
                </ol>
            </PageSection>

             <PageSection title="Technology Stack">
                <p>
                    This web application is built with a modern, performant technology stack:
                </p>
                 <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>Frontend:</strong> Built with React and TypeScript for a robust and interactive user interface.</li>
                    <li><strong>Styling:</strong> Styled using Tailwind CSS for a clean, responsive, and utility-first design.</li>
                    <li><strong>AI Engine:</strong> Powered by the <code className="bg-gray-200 px-1 rounded">gemini-2.5-flash-image</code> model via the Google Gemini API.</li>
                </ul>
            </PageSection>
        </div>
    );
};
