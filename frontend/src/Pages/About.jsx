import { Link } from "react-router-dom";
import { CakeSlice, Heart, Award, Users } from "lucide-react";

const stats = [
  { label: "Happy Customers", value: "10,000+", icon: Users },
  { label: "Cake Flavors", value: "120+", icon: CakeSlice },
  { label: "Years of Love", value: "8+", icon: Heart },
  { label: "Awards Won", value: "25", icon: Award },
];

const team = [
  { name: "Ossam Khan", role: "Founder & Head Baker", initials: "OK" },
  { name: "Priya Sharma", role: "Pastry Chef", initials: "PS" },
  { name: "David Lee", role: "Creative Designer", initials: "DL" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 text-pink-500 font-bold text-xl">
          <CakeSlice className="h-6 w-6" />
          OssamCake
        </Link>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-pink-500 transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-pink-500 transition-colors">Shop</Link>
          <Link to="/about" className="text-pink-500">About</Link>
          <Link to="/contact" className="hover:text-pink-500 transition-colors">Contact</Link>
          <Link to="/career" className="hover:text-pink-500 transition-colors">Careers</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50 py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Our Story
          </span>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Baked with <span className="text-pink-500">Love</span>, Delivered with Joy
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            OssamCake started in a small kitchen in 2016 with one goal: to make every celebration sweeter.
            Today we serve thousands of happy customers with artisanal cakes crafted from the finest ingredients.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-pink-100 flex items-center justify-center">
                <Icon className="h-7 w-7 text-pink-500" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-8 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-pink-100 text-lg leading-relaxed">
            We believe every milestone deserves a perfect cake. Our mission is to turn ordinary moments into
            extraordinary memories through handcrafted cakes that look stunning and taste divine.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-8 bg-[#FFF8F9]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Meet the Team</h2>
          <p className="text-gray-500 mb-12">The passionate people behind every slice.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {team.map(({ name, role, initials }) => (
              <div key={name} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-pink-50">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                <p className="text-gray-500 text-sm mt-1">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8 text-center bg-white">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Order?</h2>
        <p className="text-gray-500 mb-6">Explore our full menu and place your first order today.</p>
        <Link
          to="/shop"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg"
        >
          Explore Cake Menu
        </Link>
      </section>
    </div>
  );
}