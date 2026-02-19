import { ExternalLink } from 'lucide-react';
import { NewsletterSubscribe } from './NewsletterSubscribe';
import { Link } from 'react-router-dom';

interface FooterProps {
  showStockMediaPartners?: boolean;
}

export function Footer({ showStockMediaPartners = false }: FooterProps) {
  const portfolioLinks = [
    { name: 'Shutterstock', url: 'https://www.shutterstock.com/g/TravelTelly' },
    { name: 'Pond5', url: 'https://www.pond5.com/artist/traveltelly' },
    { name: 'Adobe Stock', url: 'https://stock.adobe.com/nl/contributor/203727529/TravelTelly' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Newsletter Subscribe */}
        <div className="max-w-2xl mx-auto mb-12">
          <NewsletterSubscribe variant="inline" source="footer" />
        </div>

        <div className={`grid grid-cols-1 ${showStockMediaPartners ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8`}>
          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              About TravelTelly
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Share and discover authentic travel experiences on Nostr. Browse reviews, stories, trip itineraries, and purchase stunning travel photography.
            </p>
            <Link 
              to="/traveltelly-tour" 
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              🌍 TravelTelly Tour
            </Link>
          </div>

          {/* Stock Photography Portfolios - Only show on marketplace pages */}
          {showStockMediaPartners && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Our Travel Stock Media Partners
              </h3>
              <ul className="space-y-2">
                {portfolioLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {link.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Powered By */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Powered By
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <a
                  href="https://nostr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Nostr Protocol
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} TravelTelly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
