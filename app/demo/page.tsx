import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { DemoClient } from "./demo-client";

export const metadata: Metadata = { title: "Live demo" };

export default function DemoPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="container py-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Live triage demo</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Paste a community request below. AidBridge AI classifies it, scores
            urgency, flags safety risks, and returns structured JSON — running in
            deterministic demo mode, no API key required.
          </p>
        </div>
      </section>
      <section className="container py-10">
        <DemoClient />
      </section>
    </MarketingLayout>
  );
}
