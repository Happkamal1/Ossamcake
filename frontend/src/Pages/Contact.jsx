import { useState } from "react";
import { Link } from "react-router-dom";
import { CakeSlice, Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-card" >

      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary/40 via-background to-secondary/20 py-20 px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-secondary text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Get in Touch
          </span>
          <h1 className="text-5xl font-extrabold text-foreground leading-tight mb-4">
            We'd Love to <span className="text-primary">Hear</span> From You
          </h1>
          <p className="text-lg text-muted-foreground">
            Have a question, custom order request, or just want to say hello? We're here for you!
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              <div className="flex flex-col gap-5">
                {[
                  { icon: MapPin, label: "Address", value: "123 Baker Street, New York, NY 10001" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                  { icon: Mail, label: "Email", value: "hello@ossamcake.com" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
                      <p className="text-foreground font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-3">Business Hours</h3>
              <div className="space-y-2 text-sm">
                {[
                  { day: "Monday – Friday", hours: "9:00 AM – 8:00 PM" },
                  { day: "Saturday", hours: "10:00 AM – 6:00 PM" },
                  { day: "Sunday", hours: "Closed" },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between text-muted-foreground border-b border-border pb-2">
                    <span>{day}</span>
                    <span className="font-medium text-foreground">{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 h-40 flex items-center justify-center border border-border">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">123 Baker Street, New York</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card rounded-2xl shadow-md p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            {sent && (
              <div className="mb-5 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm font-medium">
                ✓ Message sent! We'll get back to you within 24 hours.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Sarah Johnson"
                  className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="cemail">
                  Email Address
                </label>
                <input
                  id="cemail"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="sarah@example.com"
                  className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Custom cake order inquiry"
                  className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us about your cake order or any questions..."
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground resize-none"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary text-white font-semibold py-2.5 transition-colors"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}