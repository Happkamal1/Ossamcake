import { Link } from "react-router-dom";

export default function FooterColumn({ title, links }) {
  return (
    <div>
      <h3
        className="font-extrabold text-lg mb-5 pb-3"
        style={{
          color: "hsl(var(--footer-fg))",
          borderBottom: "1px solid hsl(var(--footer-fg) / 0.15)",
        }}
      >
        {title}
      </h3>
      <ul className="space-y-3 text-sm">
        {links.map((link, idx) => (
          <li key={idx}>
            <Link
              to={link.href}
              className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-300 font-medium"
              style={{ color: "hsl(var(--footer-muted))" }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
