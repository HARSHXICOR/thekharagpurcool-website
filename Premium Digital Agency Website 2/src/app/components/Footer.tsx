import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Youtube, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import logoMedium from "../../imports/logo_medium.png";

export function Footer() {
  return (
    <footer className="glass-light border-t border-white/10 mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Image src={logoMedium} alt="The Kharagpur Wala" className="h-12 w-auto mb-4" />
            <p className="text-gray-400 mb-6">
              Kharagpur's Leading Blogger & Digital Creator.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/the_kharagpur_wala_/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:glow-purple transition-all"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:glow-teal transition-all"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:glow-gold transition-all"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:glow-purple transition-all"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg mb-6">Services</h3>
            <ul className="space-y-3 text-gray-400">
              <li>Instagram Promotions</li>
              <li>Brand Collaborations</li>
              <li>Local Business Marketing</li>
              <li>Event Promotions</li>
              <li>Food Reviews</li>
              <li>Reel Promotions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <Mail size={20} className="mt-0.5 flex-shrink-0" />
                <a href="mailto:promotionthekharagpurwala@gmail.com" className="hover:text-white transition-colors">
                  promotionthekharagpurwala@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone size={20} className="mt-0.5 flex-shrink-0" />
                <span>+91 92390 63990</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="mt-0.5 flex-shrink-0" />
                <span>Paschim Midnapore, West Bengal, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 The Kharagpur Wala. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
