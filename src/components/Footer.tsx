
import React from 'react';
import { Github, Twitter, Mail, BookOpen, Database, Users } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    Platform: [
      { name: 'Search Database', href: '/search' },
      { name: 'API Documentation', href: '/api' },
      { name: 'Data Downloads', href: '/downloads' },
      { name: 'Citation Guide', href: '/citations' }
    ],
    Research: [
      { name: 'Publications', href: '/publications' },
      { name: 'Research Tools', href: '/tools' },
      { name: 'Collaboration', href: '/collaborate' },
      { name: 'Tutorials', href: '/tutorials' }
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Bug Reports', href: '/bugs' },
      { name: 'Feature Requests', href: '/features' }
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Data Usage', href: '/data-usage' },
      { name: 'Accessibility', href: '/accessibility' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NitroProteome
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The world's most comprehensive database of nitrosilated proteins, 
              empowering researchers worldwide to advance our understanding of 
              post-translational modifications.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-1">
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Database className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-2xl font-bold text-white">25,847</span>
              </div>
              <p className="text-gray-300 text-sm">Proteins in Database</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-purple-400 mr-2" />
                <span className="text-2xl font-bold text-white">12,847</span>
              </div>
              <p className="text-gray-300 text-sm">Active Researchers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-green-400 mr-2" />
                <span className="text-2xl font-bold text-white">5,672</span>
              </div>
              <p className="text-gray-300 text-sm">Publications Cited</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm mb-4 md:mb-0">
            © 2024 NitroProteome Database. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-300">
            <span>Version 2.1.0</span>
            <span>•</span>
            <span>Last updated: December 2024</span>
            <span>•</span>
            <a href="/status" className="hover:text-blue-400 transition-colors duration-200">
              System Status
            </a>
          </div>
        </div>

        {/* Research Attribution */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300 text-sm text-center">
            <strong>Research Attribution:</strong> If you use data from NitroProteome in your research, 
            please cite our database. Visit our <a href="/citations" className="text-blue-400 hover:underline">citation guide</a> for proper attribution formats.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
