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

  // Platforms / Quick Links
  const quickLinks = [
    { name: 'Knowledge Hub', href: '/knowledgehub' },
    { name: 'Green Market', href: '/greenmarket' },
    { name: 'Connect', href: '/connect' },
    { name: 'AI Assistant', href: '/chat' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Consulting Services
  const consultingServices = [
    { name: 'Rapid Farm Diagnostics', href: '/consulting#tier-1' },
    { name: 'Market Feasibility', href: '/consulting#tier-1' },
    { name: 'Business Plans', href: '/consulting#tier-2' },
    { name: 'Operations Setup', href: '/consulting#tier-3' },
    { name: 'View All Services', href: '/consulting' },
  ];

  // Resources
  const resourceLinks = [
    { name: 'Case Studies', href: '/impact' },
    { name: 'Blog', href: '/knowledgehub/insights' },
    { name: 'FAQ', href: '/consulting#faq' },
    { name: 'Book Discovery Call', href: '/consulting' },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-20 grid grid-cols-2 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-block mb-8">
              <Image
                src="/images/logo.png"
                alt="AgriPro Logo"
                width={140}
                height={45}
              />
            </Link>
            <p className="text-gray-500 mb-8 leading-relaxed max-w-sm">
              Learn, Connect, Trade & Grow Your Agribusiness. Africa&apos;s leading platform for the next generation of agribusiness builders.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map(({ Icon, href, label }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-green-600 hover:border-green-600 hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-8">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-gray-500 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Consulting Services */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-8">Consulting Services</h3>
            <ul className="space-y-4">
              {consultingServices.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-gray-500 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-8">Resources</h3>
            <ul className="space-y-4">
              {resourceLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-gray-500 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
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