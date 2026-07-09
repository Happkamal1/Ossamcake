import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  if (subscribed) {
    return (
      <div className="rounded-xl border p-4 flex items-center gap-3 animate-in fade-in zoom-in duration-300"
        style={{
          backgroundColor: "hsl(var(--footer-fg) / 0.1)",
          borderColor: "hsl(var(--footer-fg) / 0.2)",
          color: "hsl(var(--footer-fg))",
        }}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
        <span className="text-sm font-semibold">Thank you for subscribing! Welcome to the sweet club.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-sm">
      <div className="relative flex-1">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full rounded-xl h-12 pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
          style={{
            backgroundColor: "hsl(var(--footer-fg) / 0.08)",
            border: "1px solid hsl(var(--footer-fg) / 0.2)",
            color: "hsl(var(--footer-fg))",
          }}
        />
      </div>
      <Button
        type="submit"
        className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 font-bold"
      >
        <Send className="h-4.5 w-4.5 mr-2" />
        Subscribe
      </Button>
    </form>
  );
}
