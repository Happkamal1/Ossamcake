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
    <div className="min-h-screen bg-card" >
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary/40 via-background to-secondary/20 py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-secondary text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Our Story
          </span>
          <h1 className="text-5xl font-extrabold text-foreground leading-tight mb-6">
            Baked with <span className="text-primary">Love</span>, Delivered with Joy
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            OssamCake started in a small kitchen in 2016 with one goal: to make every celebration sweeter.
            Today we serve thousands of happy customers with artisanal cakes crafted from the finest ingredients.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-8 bg-card">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-3xl font-extrabold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-8 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            We believe every milestone deserves a perfect cake. Our mission is to turn ordinary moments into
            extraordinary memories through handcrafted cakes that look stunning and taste divine.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-8 bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">Meet the Team</h2>
          <p className="text-muted-foreground mb-12">The passionate people behind every slice.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {team.map(({ name, role, initials }) => (
              <div key={name} className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-border">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
                <h3 className="font-bold text-foreground text-lg">{name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8 text-center bg-card">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Order?</h2>
        <p className="text-muted-foreground mb-6">Explore our full menu and place your first order today.</p>
        <Link
          to="/shop"
          className="inline-block bg-primary hover:bg-primary text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg"
        >
          Explore Cake Menu
        </Link>
      </section>
    </div>
  );
}