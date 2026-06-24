import { Link } from "react-router-dom";
import { CakeSlice, Briefcase, MapPin, Clock } from "lucide-react";

const openings = [
  {
    title: "Senior Pastry Chef",
    dept: "Kitchen",
    location: "New York, NY",
    type: "Full-time",
    desc: "Lead our cake creation team and develop new seasonal flavors and custom designs.",
  },
  {
    title: "Delivery Coordinator",
    dept: "Operations",
    location: "Remote",
    type: "Part-time",
    desc: "Manage and optimize our last-mile delivery for premium cake orders across the city.",
  },
  {
    title: "Frontend Developer",
    dept: "Technology",
    location: "Remote",
    type: "Full-time",
    desc: "Help build the next generation of our online ordering platform using React.",
  },
  {
    title: "Customer Delight Manager",
    dept: "Support",
    location: "New York, NY",
    type: "Full-time",
    desc: "Ensure every customer has an outstanding experience from order to delivery.",
  },
];

const perks = [
  { emoji: "🎂", label: "Free cakes on your birthday" },
  { emoji: "🏥", label: "Full health & dental coverage" },
  { emoji: "🌎", label: "Remote-friendly culture" },
  { emoji: "📈", label: "Equity & profit sharing" },
  { emoji: "🍰", label: "Daily team tastings" },
  { emoji: "🎓", label: "Learning & development budget" },
];

export default function Career() {
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
          <Link to="/about" className="hover:text-pink-500 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-pink-500 transition-colors">Contact</Link>
          <Link to="/career" className="text-pink-500">Careers</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50 py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Join Our Team
          </span>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Careers at <span className="text-pink-500">OssamCake</span>
          </h1>
          <p className="text-lg text-gray-600">
            Be part of a passionate team that brings joy to people one cake at a time.
            We're always looking for talented people who love what they do.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Why Work With Us?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {perks.map(({ emoji, label }) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:border-pink-200 hover:bg-pink-50 transition-all">
                <div className="text-3xl mb-3">{emoji}</div>
                <p className="font-medium text-gray-700">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Open Positions</h2>
          <div className="flex flex-col gap-5">
            {openings.map((job) => (
              <div key={job.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-4 w-4 text-pink-500" />
                      <span className="text-xs font-semibold text-pink-600 uppercase tracking-wide">{job.dept}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{job.desc}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {job.type}
                      </span>
                    </div>
                  </div>
                  <a
                    href="mailto:careers@ossamcake.com"
                    className="shrink-0 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8 text-center bg-gradient-to-r from-pink-500 to-pink-600 text-white">
        <h2 className="text-3xl font-bold mb-4">Don't See Your Role?</h2>
        <p className="text-pink-100 mb-6">We're always open to talented people. Send us your resume!</p>
        <a
          href="mailto:careers@ossamcake.com"
          className="inline-block bg-white text-pink-600 font-semibold px-8 py-3 rounded-lg hover:bg-pink-50 transition-colors"
        >
          Send Open Application
        </a>
      </section>
    </div>
  );
}