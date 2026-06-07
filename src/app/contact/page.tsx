import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Shiftly",
  description: "Get in touch about Shiftly.",
};

export default function ContactPage() {
  return (
    <main className="flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-2xl px-6 py-16">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
          Get in touch
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
          Contact me
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Found a bug, want a new feature, or have a question about Shiftly?
          Reach out — happy to hear from you.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ContactCard
            label="Email"
            value="jamyarrahman82@gmail.com"
            href="mailto:jamyarrahman82@gmail.com"
          />
          <ContactCard
            label="GitHub"
            value="github.com/Jamy11"
            href="https://github.com/Jamy11"
          />
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            About this project
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Shiftly is a single-page scheduling app for retail and service
            teams: assign day and evening shifts, auto-generate breaks without
            conflicts, and print the whole schedule on one sheet.
          </p>
        </div>
      </section>
    </main>
  );
}

function ContactCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-900 break-all">
        {value}
      </p>
    </a>
  );
}
