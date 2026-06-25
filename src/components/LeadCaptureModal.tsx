import { type ChangeEvent, type FormEvent, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CONTACT_MAILTO_URL, GOOGLE_APPS_SCRIPT_URL } from "@/lib/contact";

type LeadCaptureModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type LeadFormState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

const initialFormState: LeadFormState = {
  name: "",
  email: "",
  company: "",
  message: "",
};

const LeadCaptureModal = ({ open, onOpenChange }: LeadCaptureModalProps) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
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
          submittedAt: new Date().toISOString(),
          source: "GridForge website",
        }),
      });

      setFormData(initialFormState);
      setStatusMessage("Thanks - your request was submitted.");
      toast({
        title: "Request submitted",
        description: "Thanks - GridForge will follow up soon.",
      });
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
      toast({
        title: "Submission failed",
        description: "Please try again, or contact GridForge by email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setStatusMessage("");
        }
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-border bg-card p-0 shadow-2xl sm:max-w-xl">
        <div className="bg-[radial-gradient(ellipse_at_top_right,_hsl(199_88.7%_48.4%_/_0.10),_transparent_55%)] p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-foreground">
              Get early access
            </DialogTitle>
            <DialogDescription>
              Share what you are trying to verify, and GridForge will follow up.
            </DialogDescription>
          </DialogHeader>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="lead-name">Name</Label>
              <Input
                id="lead-name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-company">Company</Label>
              <Input
                id="lead-company"
                name="company"
                autoComplete="organization"
                value={formData.company}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-message">
                Message / what you are trying to verify
              </Label>
              <Textarea
                id="lead-message"
                name="message"
                className="min-h-28 resize-y"
                value={formData.message}
                onChange={handleFieldChange}
                required
              />
            </div>

            {statusMessage ? (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {statusMessage}
              </p>
            ) : null}

            <DialogFooter className="gap-3 sm:gap-2">
              <a
                href={CONTACT_MAILTO_URL}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
              >
                Contact us
              </a>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60 glow"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
