import { Link } from "react-router-dom";
import logoSymbol from "@/assets/logo-symbol.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6 bg-background">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logoSymbol} alt="GridForge" className="h-8 w-8" />
          <div>
            <p className="font-display font-semibold text-lg text-foreground">GridForge</p>
            <p className="text-muted-foreground text-sm">Infrastructure for the flexible grid</p>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <Link
            to="/demand-flexibility"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Demand Flexibility
          </Link>
          <p className="text-muted-foreground/60 text-xs">© {new Date().getFullYear()} GridForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
