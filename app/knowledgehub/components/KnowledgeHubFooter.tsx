'use client';

import Link from 'next/link';
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import ChatbotDialog from './chatbot/ChatbotDialog';

export default function KnowledgeHubFooter() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Knowledge Hub</h3>
            <p className="text-sm text-gray-300">
              Africa&apos;s leading platform for agribusiness knowledge, insights, and best practices.
            </p>
            <div className="mt-4 flex space-x-4">
              <a 
                href="https://x.com/Agriprotweet?t=tMp0-ZiG3aHf3OU7E3PQuw&s=09" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Twitter page" 
                className="text-gray-300 hover:text-white"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/15qCFnLXMs/" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page" 
                className="text-gray-300 hover:text-white"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/agriprohub/" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our LinkedIn page" 
                className="text-gray-300 hover:text-white"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/agri.pro?igsh=YnRjOHBtbjZ1ZmUw" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Instagram page" 
                className="text-gray-300 hover:text-white"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/knowledgehub/practices" className="text-gray-300 hover:text-white">
                  Best Practices
                </Link>
              </li>
              <li>
                <Link href="/knowledgehub/experts" className="text-gray-300 hover:text-white">
                  Experts
                </Link>
              </li>
              <li>
                <Link href="/knowledgehub/whitepapers" className="text-gray-300 hover:text-white">
                  Whitepapers
                </Link>
              </li>
              <li>
                <Link href="/knowledgehub/insights" className="text-gray-300 hover:text-white">
                  Insights
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About AgriPro
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-300 hover:text-white">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="text-gray-300 hover:text-white flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask AI Assistant</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
            <p className="text-sm text-gray-300 mb-4">
              Get the latest updates and insights delivered to your inbox.
            </p>
            <form className="space-y-2">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-300 text-center">
            &copy; {new Date().getFullYear()} AgriPro. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Chatbot Dialog */}
      <ChatbotDialog isOpen={isChatOpen} onCloseDialog={() => setIsChatOpen(false)} />
    </footer>
  );
}
