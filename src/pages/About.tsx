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

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
        About wallpaint
      </h1>

      <PageSection title="Our Mission">
        <p>
          Choosing the right paint color can be daunting. Swatches look
          different on a screen versus on a wall, and it's hard to imagine how a
          color will truly transform a space. Our mission is to eliminate the
          guesswork. The wallpaint visualizer was created to empower homeowners,
          designers, and DIY enthusiasts to make confident color decisions by
          seeing the results before a single can of paint is opened.
        </p>
      </PageSection>

      <PageSection title="How It Works">
        <p>
          This application leverages the power of Google's advanced Gemini
          model, a cutting-edge generative AI. When you upload a photo of your
          room, here’s what happens behind the scenes:
        </p>
        <ol className="list-decimal list-inside space-y-2 pl-4">
          <li>
            <strong>Image Analysis:</strong> The AI carefully analyzes your
            photo to identify the structural walls, distinguishing them from
            furniture, trim, ceilings, and other objects.
          </li>
          <li>
            <strong>Color Application:</strong> It then digitally repaints the
            identified wall surfaces with your selected color.
          </li>
          <li>
            <strong>Realistic Rendering:</strong> Crucially, the AI preserves
            the original lighting, shadows, and textures of your room. This
            ensures the final visualization looks incredibly realistic, not like
            a flat cartoon. It understands how light interacts with surfaces to
            give you an authentic preview.
          </li>
        </ol>
      </PageSection>

      {/* --- ADD THIS NEW SECTION --- */}
      <PageSection title="Contact Us">
        <p>
          Have a question, suggestion, or feedback? We'd love to hear from you.
        </p>
        <p>
          Please reach out to us at:{" "}
          <a
            href="mailto:contact@toolwebsite"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
          contact@toolwebsite.in
          </a>
        </p>
      </PageSection>
      {/* --- END OF NEW SECTION --- */}
    </div>
  );
};
