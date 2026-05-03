"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactForm() {
  const [formValues, setFormValues] = useState(initialFormState);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof typeof initialFormState, value: string) => {
    setFormValues((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.name || !formValues.email || !formValues.subject || !formValues.message) {
      setStatus({ type: "error", message: "Please complete your name, email, subject, and message." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit message.");
      }

      setFormValues(initialFormState);
      setStatus({ type: "success", message: "Your message has been sent. Admin can now review it." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Failed to submit message." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {status && (
        <div
          className={`col-span-full rounded-2xl border p-4 text-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
              : "border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Your name</label>
        <input
          type="text"
          value={formValues.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="e.g. Fatima Bello"
          className="h-12 rounded-xl border border-transparent bg-zinc-100 px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-0"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Email address</label>
        <input
          type="email"
          value={formValues.email}
          onChange={(event) => handleChange("email", event.target.value)}
          placeholder="you@example.com"
          className="h-12 rounded-xl border border-transparent bg-zinc-100 px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-0"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Phone (optional)</label>
        <input
          type="tel"
          value={formValues.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
          placeholder="+234 …"
          className="h-12 rounded-xl border border-transparent bg-zinc-100 px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-0"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Subject</label>
        <input
          type="text"
          value={formValues.subject}
          onChange={(event) => handleChange("subject", event.target.value)}
          placeholder="e.g. Order enquiry"
          className="h-12 rounded-xl border border-transparent bg-zinc-100 px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-0"
        />
      </div>

      <div className="col-span-full flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Message</label>
        <textarea
          rows={5}
          value={formValues.message}
          onChange={(event) => handleChange("message", event.target.value)}
          placeholder="How can we help you?"
          className="w-full rounded-xl border border-transparent bg-zinc-100 px-4 py-3.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-0 resize-none"
        />
      </div>

      <div className="col-span-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl sm:w-auto">
          {isSubmitting ? "Sending..." : "Send message →"}
        </Button>
      </div>
    </form>
  );
}
