import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";

import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GOOGLE_APPS_SCRIPT_URL } from "@/lib/contact";

const ASSETS = [
  "EV",
  "Battery",
  "Solar",
  "Smart thermostat",
  "EV charger",
  "HVAC / building systems",
  "Other",
];

const CUSTOMER_TYPES = ["Homeowner", "Renter", "Business", "Other"];
const PROGRAM_OPTIONS = ["Yes", "No", "Not sure"];

const FLEX_NOW = "I can provide grid flexibility today";
const FLEX_LATER = "Not yet, but I'm interested";

const DemandFlexibility = () => {
  const [status, setStatus] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [program, setProgram] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    zip: "",
    utility: "",
    customerType: "",
  });

  useEffect(() => {
    document.title = "Demand Flexibility | GridForge";
  }, []);

  const canFlexToday = status === FLEX_NOW;

  const toggleAsset = (asset: string) =>
    setSelectedAssets((current) =>
      current.includes(asset)
        ? current.filter((item) => item !== asset)
        : [...current, asset],
    );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          ...form,
          flexibilityStatus: status,
          assets: canFlexToday ? selectedAssets.join(", ") : "",
          programEnrollment: canFlexToday ? program : "",
          submittedAt: new Date().toISOString(),
          source: "GridForge demand flexibility list",
        }),
      });
    } catch {
      // no-cors submissions cannot be inspected; fall through to success state
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(199_88.7%_48.4%_/_0.08),_transparent_60%)]" />

        <SiteHeader variant="page" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground tracking-wide">Demand flexibility</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.05] mb-6 text-foreground"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Trust for the <span className="text-gradient-primary">Flexible Grid</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            The infrastructure layer that verifies and coordinates flexible electricity demand.
          </motion.p>

          <a
            href="#join"
            className="mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity glow"
          >
            Join the list
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      <section id="join" className="section-light border-t border-border py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-primary font-medium mb-3">Join the list</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Help us make demand flexibility real.
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed mb-12">
            We're building a list of people who want to participate in the future of a more flexible
            grid — whether you can provide flexibility today or you're interested in participating
            someday.
          </p>

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
            <aside className="rounded-2xl border border-border bg-card p-8">
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Why we're collecting this
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">
                Show where customer interest already exists.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Knowing where people are interested helps make the opportunity more visible. If a
                relevant utility, program, technology, or demand flexibility opportunity becomes
                available in your area, GridForge may reach out.
              </p>
            </aside>

            <div className="rounded-2xl border border-border bg-card p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl">
                    ✓
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                    You're on the list.
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Thanks for helping us understand where demand flexibility interest exists. If
                    something relevant becomes available in your area, GridForge may reach out.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <fieldset className="space-y-3">
                    <legend className="font-display text-base font-semibold text-foreground mb-3">
                      What best describes you?
                    </legend>

                    {[
                      {
                        value: FLEX_NOW,
                        title: "I can provide grid flexibility today",
                        description:
                          "I already have a device, building, or energy use that could potentially be flexible.",
                      },
                      {
                        value: FLEX_LATER,
                        title: "Not yet — but I'm interested",
                        description:
                          "I'd be interested in participating in demand flexibility opportunities in the future.",
                      },
                    ].map((choice) => (
                      <label
                        key={choice.value}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                          status === choice.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="flexibility_status"
                          value={choice.value}
                          checked={status === choice.value}
                          onChange={() => {
                            setStatus(choice.value);
                            if (choice.value !== FLEX_NOW) {
                              setSelectedAssets([]);
                              setProgram("");
                            }
                          }}
                          required
                          className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                        />
                        <span>
                          <span className="block text-sm font-medium text-foreground">{choice.title}</span>
                          <span className="block text-sm text-muted-foreground mt-1">
                            {choice.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </fieldset>

                  {status ? (
                    <div className="space-y-8">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="df-name">Name</Label>
                          <Input
                            id="df-name"
                            autoComplete="name"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="df-email">Email</Label>
                          <Input
                            id="df-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="df-zip">ZIP code</Label>
                          <Input
                            id="df-zip"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            pattern="[0-9]{5}(-[0-9]{4})?"
                            placeholder="e.g. 94612"
                            required
                            value={form.zip}
                            onChange={(e) => setForm({ ...form, zip: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="df-utility">Electricity provider</Label>
                          <Input
                            id="df-utility"
                            placeholder="e.g. PG&E, SCE, SMUD, or Not sure"
                            required
                            value={form.utility}
                            onChange={(e) => setForm({ ...form, utility: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="df-customer-type">I am a</Label>
                          <select
                            id="df-customer-type"
                            required
                            value={form.customerType}
                            onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="" disabled>
                              Select one
                            </option>
                            {CUSTOMER_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {canFlexToday ? (
                        <div className="space-y-6 rounded-xl border border-border bg-background p-6">
                          <div>
                            <p className="font-display text-sm font-semibold text-foreground">
                              What do you have?
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Select anything that applies.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {ASSETS.map((asset) => {
                                const active = selectedAssets.includes(asset);
                                return (
                                  <button
                                    key={asset}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => toggleAsset(asset)}
                                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                                      active
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                                    }`}
                                  >
                                    {asset}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <p className="font-display text-sm font-semibold text-foreground">
                              Are you already participating in an energy flexibility or demand
                              response program?{" "}
                              <span className="font-sans text-xs font-normal text-muted-foreground">
                                Optional
                              </span>
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {PROGRAM_OPTIONS.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  aria-pressed={program === option}
                                  onClick={() => setProgram(option)}
                                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                                    program === option
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60 glow"
                        >
                          {isSubmitting ? "Submitting..." : "Join the list"}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          Joining this list does not enroll you in an energy or utility program.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default DemandFlexibility;
