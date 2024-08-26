// components/Footer.tsx
import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="/images/logo.png" alt="AgriPro Logo" className="h-12 w-auto mb-4" />
            <p className="text-gray-400 mb-4">Empowering Agripreneurs, Transforming Agriculture.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Services</span>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Contact</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/research">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Agribusiness Research</span>
                </Link>
              </li>
              <li>
                <Link href="/services/advisory">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Advisory & Mentorship</span>
                </Link>
              </li>
              <li>
                <Link href="/services/training">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Training & Capacity Building</span>
                </Link>
              </li>
              <li>
                <Link href="/services/innovation">
                  <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Innovation & Technology</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Subscribe to Our Newsletter</h3>
            <form className="flex items-center">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <hr className="my-8 border-gray-700" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">&copy; 2024 AgriPro. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/terms">
              <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Terms of Service</span>
            </Link>
            <Link href="/privacy">
              <span className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">Privacy Policy</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;