import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  Database,
  FileSearch,
  GitBranch,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency & Methodology - HalalIQ" },
      {
        name: "description",
        content:
          "How HalalIQ validates inputs, normalizes ingredients, queries a compliance graph, and produces audit-friendly halal readiness reports.",
      },
      { property: "og:title", content: "HalalIQ Transparency & Methodology" },
      {
        property: "og:description",
        content:
          "A clear look at HalalIQ's graph-based halal pre-certification readiness workflow.",
      },
    ],
  }),
  component: TransparencyPage,
});

const ARCHITECTURE_STEPS = [
  {
    icon: FileSearch,
    title: "Input review",
    description:
      "Users provide a product name, market, domain, and ingredients. Label-photo OCR is review-first so users can correct extraction mistakes before scanning.",
  },
  {
    icon: ShieldCheck,
    title: "Validation",
    description:
      "The Edge Function rejects unsafe or incomplete requests before any graph query or database write happens.",
  },
  {
    icon: GitBranch,
    title: "Knowledge graph",
    description:
      "Neo4j connects ingredients to risk levels, affected markets, domains, and required evidence documents.",
  },
  {
    icon: Layers,
    title: "Readiness report",
    description:
      "HalalIQ groups findings into blockers, warnings, and low-risk items, then saves the report for audit history.",
  },
];

const DATA_LAYERS = [
  {
    title: "Supabase Postgres",
    description:
      "Stores products, submissions, target markets, normalized ingredients, and generated compliance reports.",
  },
  {
    title: "Neo4j",
    description:
      "Stores the compliance knowledge graph used to evaluate ingredient, market, and domain relationships.",
  },
  {
    title: "Supabase Edge Functions",
    description:
      "Runs the backend validation, normalization, graph querying, report generation, persistence, and image extraction endpoints.",
  },
  {
    title: "React frontend",
    description:
      "Provides manual scans, label-photo review flow, domain selection, expandable risk details, and scan history.",
  },
];

const SAFETY_PRINCIPLES = [
  {
    icon: AlertTriangle,
    title: "Pre-certification, not a final fatwa",
    description:
      "HalalIQ flags readiness risks and required evidence. Final certification remains with qualified halal authorities.",
  },
  {
    icon: ShieldCheck,
    title: "Review before automation",
    description:
      "OCR and image extraction are treated as assistive signals. Users review extracted ingredients before analysis.",
  },
  {
    icon: BookOpen,
    title: "Evidence-first output",
    description:
      "Risk findings include reasoning and document requirements so manufacturers know what to fix or prove.",
  },
  {
    icon: Database,
    title: "Auditable history",
    description:
      "Each scan can be stored with its product, ingredients, market, report JSON, and previous submission history.",
  },
];

function TransparencyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
        style={{ background: "var(--gradient-aurora)" }}
      />
      <Nav />
      <main className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-xs uppercase tracking-widest text-jade">Transparency</div>
        <h1 className="font-display mt-4 max-w-3xl text-balance text-4xl font-light leading-[1.05] sm:text-5xl md:text-6xl">
          Built to show the{" "}
          <span className="italic text-gradient-jade">reason behind every risk.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-muted-foreground">
          HalalIQ is a B2B pre-certification readiness platform. It does not replace halal
          authorities. It helps manufacturers find ingredient, market, and evidence gaps before
          applying for certification.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:mt-16 sm:grid-cols-2 md:grid-cols-4">
          {ARCHITECTURE_STEPS.map((step) => (
            <div key={step.title} className="bg-surface p-6">
              <step.icon className="h-5 w-5 text-jade" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-16 sm:mt-24">
          <h2 className="font-display text-2xl sm:text-3xl">System layers</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The MVP keeps compliance reasoning separate from storage and user experience, so the
            platform can grow into food, cosmetics, pharmaceuticals, and export compliance without
            turning into a black box.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {DATA_LAYERS.map((layer) => (
              <div key={layer.title} className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Database className="h-4 w-4 text-jade" />
                  {layer.title}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {layer.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <h2 className="font-display text-2xl sm:text-3xl">Safety principles</h2>
          <div className="mt-6 space-y-px overflow-hidden rounded-2xl border border-hairline bg-hairline">
            {SAFETY_PRINCIPLES.map((principle) => (
              <div key={principle.title} className="flex items-start gap-5 bg-surface p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade/10 text-jade">
                  <principle.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-lg">{principle.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
