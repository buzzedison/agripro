// components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-12">
      <hr className="border-t-2 border-gray-300 py-4"/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <Image src="/images/logo.png" alt="AgriPro Logo" width={120} height={40} className="mb-4" />
            </Link>
            <p className="text-sm mb-4">Empowering Agripreneurs, Transforming Agriculture.</p>
            <div className="flex space-x-4">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, index) => (
                <a key={index} href="#" className="text-gray-400 hover:text-green-600 transition duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Services', 'Impact', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-green-600 transition duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Our Services</h3>
            <ul className="space-y-2">
              {['Agribusiness Research', 'Advisory & Mentorship', 'Training & Capacity Building', 'Innovation & Technology'].map((service) => (
                <li key={service}>
                  <Link href={`/services/${service.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="hover:text-green-600 transition duration-300">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Stay Updated</h3>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your Email"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300"
              >
                Subscribe to Newsletter
              </button>
            </form>
          </div>
        </div>
        <hr className="my-8 border-gray-200" />
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} AgriPro. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-green-600 transition duration-300">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-green-600 transition duration-300">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;