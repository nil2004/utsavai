import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and tagline */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-bold text-xl text-primary">
                Utsav<span className="text-accent">AI</span>
              </span>
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md uppercase">Beta</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              AI-powered event planning made simple. Find the perfect vendors for your special occasions.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/utsavai/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary text-sm">Home</Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-600 hover:text-primary text-sm">Vendor Marketplace</Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-600 hover:text-primary text-sm">AI Planner</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary text-sm">About Us</Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">For Users</h3>
            <ul className="space-y-2">
              {user ? (
                <>
                  <li>
                    <Link to="/profile" className="text-gray-600 hover:text-primary text-sm">My Profile</Link>
                  </li>
                  <li>
                    <Link to="/my-events" className="text-gray-600 hover:text-primary text-sm">My Events</Link>
                  </li>
                  <li>
                    <Link to="/vendor-signup" className="text-gray-600 hover:text-primary text-sm">Become a Vendor</Link>
                  </li>
                  <li>
                    <Link to="/faq" className="text-gray-600 hover:text-primary text-sm">FAQ</Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/signup" className="text-gray-600 hover:text-primary text-sm">Sign Up</Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-gray-600 hover:text-primary text-sm">Login</Link>
                  </li>
                  <li>
                    <Link to="/vendor-signup" className="text-gray-600 hover:text-primary text-sm">Become a Vendor</Link>
                  </li>
                  <li>
                    <Link to="/faq" className="text-gray-600 hover:text-primary text-sm">FAQ</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">utsav.ai.event@gmail.com</li>
              <li className="text-gray-600 text-sm">+91 8974894143</li>
              <li className="text-gray-600 text-sm">
                Lmd Er Foundation Inst,
                22km Milestone Kanjibans,
                Roorkee City, Haridwar,
                Roorkee, Uttarakhand, India,
                247667
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} UtsavAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
