import { type FormEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BatteryCharging, Sparkles } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { GOOGLE_APPS_SCRIPT_URL } from "@/lib/contact";
import logo from "@/assets/logo.png";

const ASSET_OPTIONS = [
  "EV / EV charger",
  "Battery",
  "Smart thermostat",
  "Electric water heater",
  "HVAC / building systems",
  "Solar + storage",
  "Commercial or industrial load",
  "Other",
] as const;

const INTEREST_OPTIONS = [
  "Home battery storage",
  "EV / EV charger",
  "Smart thermostat",
  "Electric water heater",
  "Solar + storage",
  "Time-of-use rate plans",
  "Learning about demand response programs",
  "Other",
] as const;

const CUSTOMER_TYPES = [
  "Homeowner / resident",
  "Renter",
  "Building owner or manager",
  "Business / commercial",
  "Industrial",
  "Other",
] as const;

const initialFormState = {
  name: "",
  email: "",
  zip: "",
  provider: "",
  customerType: "",
  status: "" as "" | "today" | "future",
  assets: [] as string[],
  interests: [] as string[],
  inProgram: "",
  notify: "",
};

type FormState = typeof initialFormState;

const DemandFlexibility = () => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const chooseStatus = (status: "today" | "future") => {
    setFormData((current) => ({ ...current, status }));
    setStatusMessage("");
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const toggleAsset = (asset: string) => {
    setFormData((current) => ({
      ...current,
      assets: current.assets.includes(asset)
        ? current.assets.filter((a) => a !== asset)
        : [...current.assets, asset],
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((a) => a !== interest)
        : [...current.interests, interest],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("Submitting...");

    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          ...formData,
          assets: formData.assets.join(", "),
          interests: formData.interests.join(", "),
          submittedAt: new Date().toISOString(),
          source: "Demand Flexibility page",
        }),
      });

      setFormData(initialFormState);
      setStatusMessage("Thanks — you're on the list.");
      toast({
        title: "You're on the list",
        description: "Thanks for adding yourself to the picture.",
      });
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
      toast({
        title: "Submission failed",
        description: "Please try again, or email hello@gridforge.energy.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-5 max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" aria-label="GridForge home">
          <img src={logo} alt="GridForge Energy" className="h-14 md:h-16" />
        </Link>
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          gridforge.energy
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(199_88.7%_48.4%_/_0.08),_transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-[1.08] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Show where the <span className="text-gradient-primary">flex</span> is
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Flexible capacity already exists. Help us build a clearer picture of where it
            lives and where people are ready to participate.
          </motion.p>
          <motion.p
            className="text-muted-foreground/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Flexible capacity is already sitting in batteries, water heaters, thermostats,
            EV chargers, buildings, and other electricity loads. But much of it is difficult
            for the people planning and operating the grid to see.
          </motion.p>
        </div>
      </section>

      {/* Why this matters */}
      <section className="section-light">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight mb-4">
            The grid can't plan around flexibility it can't see.
          </h2>
          <p className="text-muted-foreground">
            Knowing where flexible resources are, what they can do, and where people are
            interested in participating can help turn distributed energy into capacity the
            grid can better understand, plan around, and eventually use.
          </p>
        </div>
      </section>

      {/* Participation */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-center mb-3">
          Add yourself to the picture
        </h2>
        <p className="text-muted-foreground text-center mb-10">Two groups are welcome here.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <button
            type="button"
            onClick={() => chooseStatus("today")}
            className={`text-left rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:glow ${
              formData.status === "today" ? "border-primary glow" : "border-border"
            }`}
          >
            <BatteryCharging className="h-7 w-7 text-primary mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">I have flexibility today</h3>
            <p className="text-sm text-muted-foreground">
              I already own or manage something that could potentially shift, reduce, store,
              or supply electricity.
            </p>
          </button>

          <button
            type="button"
            onClick={() => chooseStatus("future")}
            className={`text-left rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:glow ${
              formData.status === "future" ? "border-primary glow" : "border-border"
            }`}
          >
            <Sparkles className="h-7 w-7 text-primary mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">
              Not yet — but I'm interested
            </h3>
            <p className="text-sm text-muted-foreground">
              I would consider participating in a demand flexibility opportunity in the future.
            </p>
          </button>
        </div>
      </section>

      {/* Form — appears only after a card is selected */}
      <section ref={formRef} className="scroll-mt-8">
        <div className="max-w-2xl mx-auto px-6 pb-20">
          <AnimatePresence mode="wait">
            {formData.status && (
              <motion.div
                key={formData.status}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm"
              >
                <p className="text-muted-foreground mb-8">
                  <span className="font-semibold text-foreground">
                    Joining the list adds you to the picture.
                  </span>{" "}
                  It does not enroll you in a utility, demand response, or energy program, and it
                  does not commit you to participate in anything.
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="df-name">Name</Label>
                      <Input
                        id="df-name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setFormData((c) => ({ ...c, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="df-email">Email</Label>
                      <Input
                        id="df-email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => setFormData((c) => ({ ...c, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="df-zip">ZIP code</Label>
                      <Input
                        id="df-zip"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="e.g. 94612"
                        value={formData.zip}
                        onChange={(e) => setFormData((c) => ({ ...c, zip: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="df-provider">Electricity provider</Label>
                      <Input
                        id="df-provider"
                        placeholder="e.g. PG&E, SCE, SMUD, or Not sure"
                        value={formData.provider}
                        onChange={(e) => setFormData((c) => ({ ...c, provider: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Which best describes you?</Label>
                    <Select
                      value={formData.customerType}
                      onValueChange={(value) => setFormData((c) => ({ ...c, customerType: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select one" />
                      </SelectTrigger>
                      <SelectContent>
                        {CUSTOMER_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.status === "today" ? (
                    <>
                      <div className="space-y-3">
                        <Label>
                          What do you have?{" "}
                          <span className="text-muted-foreground font-normal">
                            (select any that apply)
                          </span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {ASSET_OPTIONS.map((asset) => {
                            const active = formData.assets.includes(asset);
                            return (
                              <button
                                key={asset}
                                type="button"
                                onClick={() => toggleAsset(asset)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-muted/40 text-foreground hover:border-primary/50"
                                }`}
                              >
                                {asset}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>
                          Are you already participating in a demand flexibility or demand
                          response program?
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {["Yes", "No", "Not sure"].map((opt) => {
                            const value = opt === "Not sure" ? "notsure" : opt.toLowerCase();
                            const active = formData.inProgram === value;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                  setFormData((c) => ({ ...c, inProgram: value }))
                                }
                                className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-colors ${
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-muted/40 text-foreground hover:border-primary/50"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <Label>
                          What are you most interested in?{" "}
                          <span className="text-muted-foreground font-normal">
                            (select any that apply)
                          </span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {INTEREST_OPTIONS.map((interest) => {
                            const active = formData.interests.includes(interest);
                            return (
                              <button
                                key={interest}
                                type="button"
                                onClick={() => toggleInterest(interest)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-muted/40 text-foreground hover:border-primary/50"
                                }`}
                              >
                                {interest}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>
                          Would you like to be notified when a program is available in your
                          area?
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Yes — let me know", value: "yes" },
                            { label: "Not right now", value: "no" },
                          ].map((opt) => {
                            const active = formData.notify === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                  setFormData((c) => ({ ...c, notify: opt.value }))
                                }
                                className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-colors ${
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-muted/40 text-foreground hover:border-primary/50"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {statusMessage ? (
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                      {statusMessage}
                    </p>
                  ) : null}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60 glow"
                    >
                      {isSubmitting ? "Submitting..." : "Join the list"}
                    </button>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Joining this list does not enroll you in an energy or utility program.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* A few things to know */}
      <section className="section-light">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-center mb-8">
            A few things to know
          </h2>
          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6">
            <AccordionItem value="use">
              <AccordionTrigger className="text-left">
                How will my information be used?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">
                  Submissions help GridForge build an aggregate picture of where flexible
                  capacity exists and where people are interested in participating.
                </p>
                <p className="mb-3">
                  Individual submissions are not published, sold, or licensed.
                </p>
                <p>
                  GridForge will not share personally identifiable submission information with
                  utilities, program operators, or other third parties without permission.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="public">
              <AccordionTrigger className="text-left">
                What information could appear publicly?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">Any public information will be aggregated.</p>
                <p className="mb-3">
                  A ZIP code will not appear publicly until at least five submissions have been
                  received for that ZIP code.
                </p>
                <p>
                  Names, email addresses, contact information, and street addresses will never
                  appear on the public map.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="remove">
              <AccordionTrigger className="text-left">
                Can I remove my information?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">
                  Yes. Removal requests can be sent to:{" "}
                  <a
                    href="mailto:hello@gridforge.energy"
                    className="text-primary hover:underline"
                  >
                    hello@gridforge.energy
                  </a>
                </p>
                <p>Associated records will be deleted within 30 days.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="why-both">
              <AccordionTrigger className="text-left">
                Why collect both existing assets and future interest?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">Both tell us something different.</p>
                <p className="mb-3">
                  Existing flexible assets help show where capacity may already exist.
                </p>
                <p>
                  Interest from people who do not yet have flexible assets helps show where
                  future participation and program demand may be growing.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Future map placeholder */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14">
          <div className="grid-bg h-24 w-full max-w-md mx-auto rounded-xl opacity-40 mb-8" />
          <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight mb-3">
            The picture is just getting started
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            As submissions grow, this space will show an aggregate view of participation —
            total submissions, states represented, and flexible assets — with ZIP-level detail
            appearing only once privacy thresholds are met.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            A{" "}
            <Link to="/" className="text-foreground hover:underline">
              GridForge
            </Link>{" "}
            initiative
          </p>
          <a href="mailto:hello@gridforge.energy" className="hover:text-foreground transition-colors">
            hello@gridforge.energy
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DemandFlexibility;
