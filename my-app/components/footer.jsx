import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Shield,
  Lock,
  Award,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/' },
      { name: 'Pricing', href: '/' },
      { name: 'API', href: '/' },
      { name: 'Integrations', href: '/' },
      { name: 'Mobile App', href: '/' },
    ],
    company: [
      { name: 'About Us', href: '/' },
      { name: 'Careers', href: '/' },
      { name: 'Press', href: '/' },
      { name: 'Blog', href: '/' },
      { name: 'Partners', href: '/' },
    ],
    resources: [
      { name: 'Help Center', href: '/' },
      { name: 'Documentation', href: '/' },
      { name: 'Tutorials', href: '/' },
      { name: 'Community', href: '/' },
      { name: 'Status', href: '/' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/' },
      { name: 'Terms of Service', href: '/' },
      { name: 'Cookie Policy', href: '/' },
      { name: 'GDPR', href: '/' },
      { name: 'Security', href: '/' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/welth' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/welth' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/welth' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/welth' },
  ];

  return (
    <footer className="bg-gray-800 text-gray-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Main Footer Content */}
      <div className="relative z-10">

        {/* Main Footer Links */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">Welth</h3>
                <p className="text-sm text-gray-400 mt-1">Financial Management Platform</p>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The most intelligent financial management platform that helps you track expenses, 
                set budgets, and achieve your financial goals with AI-powered insights.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-3 text-blue-400" />
                  <span>welth@support.ac.in</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-3 text-blue-400" />
                  <span>+91 98263 73848</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-3 text-blue-400" />
                  <span>Anand, India</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300 group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-5 w-5 text-gray-300 group-hover:text-white group-hover:scale-110 transition-transform" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-wrap items-center space-x-8 mb-4 md:mb-0">
                <div className="flex items-center text-gray-400">
                  <Shield className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">Bank-level Security</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Lock className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-sm">256-bit SSL</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Award className="h-4 w-4 mr-2 text-yellow-400" />
                  <span className="text-sm">SOC 2 Certified</span>
                </div>
              </div>
              
              <div className="text-gray-400 text-sm">
                <span>Trusted by 50,000+ users worldwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © {currentYear} Welth. All rights reserved.
              </div>
              
              <div className="flex items-center text-gray-400 text-sm">
                <span>Made with</span>
                <Heart className="h-4 w-4 mx-1 text-red-500" />
                <span>by the Welth team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
