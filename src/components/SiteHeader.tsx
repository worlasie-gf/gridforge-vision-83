import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

type SiteHeaderProps = {
  variant?: "hero" | "page";
};

const SiteHeader = ({ variant = "hero" }: SiteHeaderProps) => {
  const isHero = variant === "hero";
  const homeHref = (hash: string) => (isHero ? hash : `/${hash}`);

  return (
    <div
      className={
        isHero
          ? "absolute top-0 left-0 right-0 z-20 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full"
          : "relative z-20 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full"
      }
    >
      <Link to="/" aria-label="GridForge home">
        <img src={logo} alt="GridForge Energy" className="h-28 md:h-32" />
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <a href={homeHref("#problem")} className="hover:text-foreground transition-colors">Problem</a>
        <a href={homeHref("#how-we-fit")} className="hover:text-foreground transition-colors">How we fit</a>
        <a href={homeHref("#trust-ladder")} className="hover:text-foreground transition-colors">Trust Ladder</a>
        <a href={homeHref("#who-we-serve")} className="hover:text-foreground transition-colors">Who we serve</a>
        <Link to="/demand-flexibility" className="hover:text-foreground transition-colors">
          Demand Flexibility
        </Link>
      </nav>
    </div>
  );
};

export default SiteHeader;
