import logoSymbol from "@/assets/logo-symbol.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logoSymbol} alt="GridForge" className="h-8 w-8" />
          <div>
            <p className="font-display font-semibold text-lg">GridForge</p>
          <p className="text-muted-foreground text-sm mt-1">Infrastructure for the flexible grid</p>
        </div>
        <p className="text-muted-foreground/50 text-xs">© {new Date().getFullYear()} GridForge. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
