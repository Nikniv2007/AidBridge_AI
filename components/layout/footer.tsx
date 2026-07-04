import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            AidBridge AI turns messy community needs into structured, actionable
            aid workflows — built for nonprofits, schools, city teams, and
            volunteer organizations.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Public-interest technology. Humans stay in the loop.
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Product</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li><Link href="/how-it-works" className="hover:text-foreground">How it works</Link></li>
            <li><Link href="/use-cases" className="hover:text-foreground">Use cases</Link></li>
            <li><Link href="/demo" className="hover:text-foreground">Live demo</Link></li>
            <li><Link href="/dashboard/command-center" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Responsibility</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li><Link href="/safety" className="hover:text-foreground">Safety & limits</Link></li>
            <li><Link href="/dashboard/eval-lab" className="hover:text-foreground">AI evaluations</Link></li>
            <li>
              <a
                href="https://github.com/Nikniv2007/AidBridge_AI"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} AidBridge AI. MIT licensed.</p>
          <p>Does not replace emergency services. Call 911 in an emergency.</p>
        </div>
      </div>
    </footer>
  );
}
