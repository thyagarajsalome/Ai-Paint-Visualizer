import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MainContent } from './components/MainContent';
import { AboutPage } from './pages/About';
import { PolicyPage } from './pages/Policy';
import { DisclaimerPage } from './pages/Disclaimer';
import { ContactPage } from './pages/Contact';
import { FaqPage } from './pages/Faq';

const routes: { [key: string]: React.FC } = {
  '': MainContent,
  '#about': AboutPage,
  '#policy': PolicyPage,
  '#disclaimer': DisclaimerPage,
  '#contact': ContactPage,
  '#faq': FaqPage,
};

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const CurrentPage = routes[route] || MainContent;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <CurrentPage />
      </main>
      <Footer />
    </div>
  );
};

export default App;
