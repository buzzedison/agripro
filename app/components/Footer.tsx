// components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaBook, FaUsers, FaStore, FaSeedling } from 'react-icons/fa';

const Footer: React.FC = () => {
  const socialLinks = [
    { Icon: FaFacebookF, href: "https://www.facebook.com/share/15qCFnLXMs/", label: "Facebook" },
    { Icon: FaTwitter, href: "https://x.com/Agriprotweet?t=tMp0-ZiG3aHf3OU7E3PQuw&s=09", label: "Twitter/X" },
    { Icon: FaInstagram, href: "https://www.instagram.com/agri.pro?igsh=YnRjOHBtbjZ1ZmUw", label: "Instagram" },
    { Icon: FaLinkedinIn, href: "https://www.linkedin.com/company/agriprohub/", label: "LinkedIn" }
  ];

  // Four Pillars
  const pillars = [
    { name: 'Knowledge', href: '/knowledgehub', icon: FaBook },
    { name: 'Connect', href: '/connect', icon: FaUsers },
    { name: 'Trade', href: '/greenmarket', icon: FaStore },
    { name: 'Grow', href: '/services', icon: FaSeedling },
  ];

  // Resources
  const resources = [
    { name: 'Marketplace', href: '/greenmarket/marketplace' },
    { name: 'Knowledge Hub', href: '/knowledgehub' },
    { name: 'Member Directory', href: '/connect/directory' },
    { name: 'AI Assistant', href: '/chat' },
  ];

  // Company links
  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Get Involved', href: '/get-involved' },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo.png"
                alt="AgriPro Logo"
                width={140}
                height={45}
              />
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Africa&apos;s platform for agricultural knowledge, networking,
              trading, and growing your agribusiness.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-green-600 hover:border-green-600 hover:text-white transition-all duration-300 shadow-sm"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Four Pillars */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-5">Platform</h3>
            <ul className="space-y-3">
              {pillars.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
                  >
                    <item.icon className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-5">Resources</h3>
            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-5">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-5">Stay Updated</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get insights and updates delivered to your inbox.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm shadow-sm"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} AgriPro Hub. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;