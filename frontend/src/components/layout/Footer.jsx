import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  ShieldCheck,
  Share2,
} from "lucide-react";

import FooterColumn from "./Footer/FooterColumn";
import NewsletterForm from "./Footer/NewsletterForm";
import { FOOTER_LINKS } from "@/config/navigation";

export default function Footer() {
  const { settings } = useSelector((state) => state.siteSettings);

  const businessName = settings?.businessName || "OssamCake";
  const aboutText = settings?.footer?.aboutText || "Crafting premium luxury celebrations with sweet elegance since 2010. Every cake is hand-finished by master pastry artists.";
  const copyrightText = settings?.footer?.copyrightText || "OssamCake. All rights reserved.";
  const phone = settings?.phone || "+1 (555) 123-4567";
  const email = settings?.email || "hello@ossamcake.com";
  const address = settings?.address || "123 Baker Street, Manhattan, New York, NY 10001";
  const workingHours = settings?.workingHours || "Mon - Sun: 8:00 AM - 10:00 PM";
  const socialLinks = settings?.socialLinks || {};

  const socialItems = [
    { icon: Facebook, href: socialLinks.facebook || "https://facebook.com", name: "Facebook" },
    { icon: Instagram, href: socialLinks.instagram || "https://instagram.com", name: "Instagram" },
    { icon: Youtube, href: socialLinks.youtube || "https://youtube.com", name: "YouTube" },
    { icon: Twitter, href: socialLinks.twitter || "https://twitter.com", name: "X (Twitter)" },
  ].filter(s => Boolean(s.href));

  return (
    <footer
      className="font-sans border-t-4 border-primary overflow-hidden relative transition-colors duration-500"
      style={{
        backgroundColor: "hsl(var(--footer-bg))",
        color: "hsl(var(--footer-fg))",
      }}
    >
      {/* Decorative Top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      {/* Top Newsletter Section */}
      <div
        className="border-b transition-colors duration-500"
        style={{ borderColor: "hsl(var(--footer-fg) / 0.15)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-2 max-w-xl">
            <h2
              className="text-2xl font-black tracking-tight"
              style={{ color: "hsl(var(--footer-fg))" }}
            >
              Join the Sweet Club
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--footer-muted))" }}
            >
              Subscribe to our newsletter for exclusive VIP discounts, early
              access to new flavors, and sweet celebration ideas straight to
              your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

        {/* 1. Brand Column */}
        <div className="lg:col-span-1 space-y-6">
          <Link to="/" className="flex items-center group">
            <img src="/images/logo/logo.png" alt={businessName} className="h-[80px] object-contain group-hover:scale-105 transition-transform" />
          </Link>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "hsl(var(--footer-muted))" }}
          >
            {aboutText}
          </p>

          <div className="space-y-3 pt-2">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "hsl(var(--footer-muted))" }}
            >
              Follow Us
            </span>
            <div className="flex gap-3">
              {socialItems.map(({ icon: Icon, href, name }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="h-10 w-10 rounded-full hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 shadow-inner"
                  style={{
                    backgroundColor: "hsl(var(--footer-fg) / 0.1)",
                    color: "hsl(var(--footer-muted))",
                  }}
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Company */}
        <FooterColumn title="Company" links={FOOTER_LINKS.company} />

        {/* 3. Customer Support */}
        <FooterColumn title="Support" links={FOOTER_LINKS.support} />

        {/* 4. Categories */}
        <div className="space-y-10">
          <FooterColumn title="Categories" links={FOOTER_LINKS.categories} />
        </div>

        {/* 5. Contact Info */}
        <div>
          <h3
            className="font-extrabold text-lg mb-5 pb-3"
            style={{
              color: "hsl(var(--footer-fg))",
              borderBottom: "1px solid hsl(var(--footer-fg) / 0.15)",
            }}
          >
            Contact Us
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3 group">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5 group-hover:animate-bounce" />
              <span style={{ color: "hsl(var(--footer-muted))" }}>
                {address}
              </span>
            </li>
            <li className="flex items-center gap-3 group">
              <Phone className="h-5 w-5 text-primary shrink-0 group-hover:animate-pulse" />
              <a href={`tel:${phone.replace(/\s+/g, '')}`} style={{ color: "hsl(var(--footer-muted))" }} className="hover:text-primary transition-colors">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-3 group">
              <Mail className="h-5 w-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <a href={`mailto:${email}`} style={{ color: "hsl(var(--footer-muted))" }} className="hover:text-primary transition-colors">
                {email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <span style={{ color: "hsl(var(--footer-muted))" }}>
                {workingHours}
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div
        className="transition-colors duration-500"
        style={{ borderTop: "1px solid hsl(var(--footer-fg) / 0.15)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row items-center justify-between gap-6">

          {/* Copyright & Legal */}
          <div
            className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-center sm:text-left font-medium"
            style={{ color: "hsl(var(--footer-muted))" }}
          >
            <p>&copy; {new Date().getFullYear()} {copyrightText}</p>
            <span className="hidden sm:inline" style={{ color: "hsl(var(--footer-fg) / 0.3)" }}>|</span>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>

          {/* Secure & Payment */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
              style={{
                color: "hsl(var(--footer-muted))",
                backgroundColor: "hsl(var(--footer-fg) / 0.07)",
                borderColor: "hsl(var(--footer-fg) / 0.15)",
              }}
            >
              <ShieldCheck className="h-4 w-4 text-primary" /> 100% Secure Checkout
            </span>

            <div className="flex gap-2">
              {["UPI", "VISA", "Mastercard", "RuPay", "Wallets"].map((method) => (
                <div
                  key={method}
                  className="h-8 px-2.5 rounded text-[10px] font-black tracking-wider cursor-default flex items-center justify-center transition-colors"
                  title={method}
                  style={{
                    backgroundColor: "hsl(var(--footer-fg) / 0.08)",
                    borderColor: "hsl(var(--footer-fg) / 0.15)",
                    color: "hsl(var(--footer-muted))",
                    border: "1px solid hsl(var(--footer-fg) / 0.15)",
                  }}
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
