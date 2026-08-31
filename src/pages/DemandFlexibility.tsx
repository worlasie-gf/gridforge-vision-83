import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const RESOURCE_OPTIONS = [
  "EV / EV charger",
  "Battery",
  "Smart thermostat",
  "Electric water heater",
  "HVAC / building systems",
  "Solar + storage",
  "Commercial or industrial load",
  "Other",
  "None — I'm interested in demand flexibility but don't currently own or manage one of these.",
] as const;

const RESPONDENT_TYPES = [
  "Homeowner / resident",
  "Renter",
  "Building owner or manager",
  "Business / commercial",
  "Industrial",
  "Other",
] as const;

const PARTICIPATION_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Not sure", value: "not_sure" },
] as const;

const NOTIFICATION_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Maybe later", value: "maybe_later" },
] as const;

const initialSurveyState = {
  zip: "",
  provider: "",
  respondentType: "",
  resources: [] as string[],
  participation: "",
  notificationInterest: "",
  additionalInformation: "",
};

const initialContactState = {
  name: "",
  email: "",
};

const DemandFlexibility = () => {
  const [survey, setSurvey] = useState(initialSurveyState);
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);
  const [surveyMessage, setSurveyMessage] = useState("");

  const [contact, setContact] = useState(initialContactState);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactMessage, setContactMessage] = useState("");

  const toggleResource = (resource: string) => {
    setSurvey((current) => ({
      ...current,
      resources: current.resources.includes(resource)
        ? current.resources.filter((r) => r !== resource)
        : [...current.resources, resource],
    }));
  };

  const handleSurveySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingSurvey) return;

    if (!survey.zip.trim()) {
      setSurveyMessage("Please enter your ZIP code.");
      return;
    }

    setIsSubmittingSurvey(true);
    setSurveyMessage("Submitting...");

    try {
      const { error } = await supabase.from("demand_flex_responses").insert({
        zip_code: survey.zip.trim(),
        electricity_provider: survey.provider.trim() || null,
        respondent_type: survey.respondentType || null,
        resources: survey.resources,
        current_program_participation: survey.participation || null,
        notification_interest: survey.notificationInterest || null,
        additional_information: survey.additionalInformation.trim() || null,
      });

      if (error) throw error;

      setSurvey(initialSurveyState);
      setSurveyMessage("Thanks — your anonymous response was received.");
      toast({
        title: "Response received",
        description: "Thanks for adding to the picture.",
      });
    } catch {
      setSurveyMessage(
        "We couldn't save your response. Please try again, or email hello@gridforge.energy."
      );
      toast({
        title: "Submission failed",
        description: "Your response was not received. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingSurvey(false);
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingContact) return;

    if (!contact.name.trim() || !contact.email.trim()) {
      setContactMessage("Please enter your name and email.");
      return;
    }

    setIsSubmittingContact(true);
    setContactMessage("Submitting...");

    try {
      const { error } = await supabase.from("demand_flex_contacts").insert({
        name: contact.name.trim(),
        email: contact.email.trim(),
      });

      if (error) throw error;

      setContact(initialContactState);
      setContactMessage("Thanks — we'll keep you informed.");
      toast({
        title: "You're on the list",
        description: "We'll be in touch with updates.",
      });
    } catch {
      setContactMessage(
        "We couldn't save your contact information. Please try again, or email hello@gridforge.energy."
      );
      toast({
        title: "Submission failed",
        description: "Your contact information was not received. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-5 max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" aria-label="GridForge home">
          <img src={logo} alt="GridForge Energy" className="h-24 md:h-28" />
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
            Knowing where flexible resources are—and where people are interested in
            participating—can help turn distributed energy into capacity the grid can better
            understand and plan around.
          </p>
        </div>
      </section>

      {/* Section 1 — Anonymous survey */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-center mb-3">
          Share your information anonymously
        </h2>
        <p className="text-sm text-primary text-center mb-8">
          Your responses are anonymous. We do not collect your name or email in this section.
        </p>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
          <p className="text-muted-foreground mb-8">
            <span className="font-semibold text-foreground">
              Joining the list adds you to the picture.
            </span>{" "}
            It does not enroll you in a utility, demand response, or energy program, and it
            does not commit you to participate in anything.
          </p>

          <form className="space-y-6" onSubmit={handleSurveySubmit}>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="df-zip">ZIP code</Label>
                <Input
                  id="df-zip"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="e.g. 94612"
                  value={survey.zip}
                  onChange={(e) => setSurvey((c) => ({ ...c, zip: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="df-provider">Electricity provider</Label>
                <Input
                  id="df-provider"
                  placeholder="e.g. PG&E, Duke Energy, Xcel Energy, Con Edison, Evergy, or Not sure"
                  value={survey.provider}
                  onChange={(e) => setSurvey((c) => ({ ...c, provider: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Which best describes you?</Label>
              <Select
                value={survey.respondentType}
                onValueChange={(value) => setSurvey((c) => ({ ...c, respondentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  {RESPONDENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>
                What do you have?{" "}
                <span className="text-muted-foreground font-normal">
                  (select any that apply)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {RESOURCE_OPTIONS.map((resource) => {
                  const active = survey.resources.includes(resource);
                  return (
                    <button
                      key={resource}
                      type="button"
                      onClick={() => toggleResource(resource)}
                      className={`rounded-full border px-4 py-2 text-left text-sm font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/40 text-foreground hover:border-primary/50"
                      }`}
                    >
                      {resource}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>
                Are you already participating in a demand flexibility or demand response
                program?
              </Label>
              <div className="flex flex-wrap gap-2">
                {PARTICIPATION_OPTIONS.map((opt) => {
                  const active = survey.participation === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSurvey((c) => ({ ...c, participation: opt.value }))}
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

            <div className="space-y-3">
              <Label>
                Would you be interested in being notified if a demand flexibility program
                became available in your area?
              </Label>
              <div className="flex flex-wrap gap-2">
                {NOTIFICATION_OPTIONS.map((opt) => {
                  const active = survey.notificationInterest === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setSurvey((c) => ({ ...c, notificationInterest: opt.value }))
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

            <div className="space-y-2">
              <Label htmlFor="df-more">
                Anything else you'd like to share?{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="df-more"
                className="min-h-24 resize-y"
                placeholder="Please don't include your name, email, or address here."
                value={survey.additionalInformation}
                onChange={(e) =>
                  setSurvey((c) => ({ ...c, additionalInformation: e.target.value }))
                }
              />
            </div>

            {surveyMessage ? (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {surveyMessage}
              </p>
            ) : null}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingSurvey}
                className="w-full inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60 glow"
              >
                {isSubmittingSurvey ? "Submitting..." : "Submit anonymous response"}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Submitting this response does not enroll you in an energy or utility program.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Section 2 — Stay informed (optional) */}
      <section className="section-light">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight mb-3">
              Stay informed
            </h2>
            <p className="text-muted-foreground mb-3">
              Would you like to be notified when a demand flexibility program becomes
              available in your area or about future GridForge research opportunities?
            </p>
            <p className="text-sm text-primary mb-8">
              Your contact information is submitted separately and is not linked to your
              survey responses.
            </p>

            <form className="space-y-5" onSubmit={handleContactSubmit}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="df-contact-name">Name</Label>
                  <Input
                    id="df-contact-name"
                    autoComplete="name"
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="df-contact-email">Email</Label>
                  <Input
                    id="df-contact-email"
                    type="email"
                    autoComplete="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  />
                </div>
              </div>

              {contactMessage ? (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {contactMessage}
                </p>
              ) : null}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60 glow"
                >
                  {isSubmittingContact ? "Submitting..." : "Keep me informed"}
                </button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  This section is optional and is not required to submit the anonymous survey.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* A few things to know */}
      <section>
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
                  Survey responses help GridForge build an aggregate picture of where flexible
                  capacity exists and where people are interested in participating. They carry
                  no name, email, or other identifying information.
                </p>
                <p className="mb-3">
                  Individual submissions are not published, sold, or licensed.
                </p>
                <p>
                  Contact information given in "Stay informed" is stored separately from survey
                  responses and is used only to send updates.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="separate">
              <AccordionTrigger className="text-left">
                Are my survey answers linked to my contact information?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">
                  No. The two forms perform two independent submissions and are stored in
                  separate records with no shared identifier between them.
                </p>
                <p>
                  Because of that, a survey response cannot be traced back to a specific
                  person.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="public">
              <AccordionTrigger className="text-left">
                What information could appear publicly?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">Any public information will be aggregated.</p>
                <p>
                  A ZIP code will not appear publicly until at least five submissions have been
                  received for that ZIP code.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="remove">
              <AccordionTrigger className="text-left">
                Can I remove my information?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">
                  Contact information can be removed on request at:{" "}
                  <a
                    href="mailto:hello@gridforge.energy"
                    className="text-primary hover:underline"
                  >
                    hello@gridforge.energy
                  </a>
                </p>
                <p>
                  Anonymous survey responses cannot be individually retrieved or deleted,
                  because they contain nothing that identifies who submitted them.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
