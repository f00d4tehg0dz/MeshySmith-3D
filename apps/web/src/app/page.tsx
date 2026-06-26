import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CircleDot,
  Cpu,
  Download,
  Gauge,
  Globe2,
  GraduationCap,
  Hammer,
  Layers,
  Lock,
  Monitor,
  MousePointer2,
  Package,
  Palette,
  Server,
  Shapes,
  Sparkles,
  Wand2,
} from "lucide-react";

// lucide-react v1 dropped brand marks (trademark policy); inline a minimal GitHub glyph.
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12.02c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 015.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.44-2.7 5.41-5.27 5.7.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.66.79.55 4.57-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://meshysmith.app";
const RELEASE_VERSION = "0.4.0";
const RELEASE_DATE = "2026-06-26";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MeshySmith — Free local-first 3D editor for makers, classrooms, and prototyping",
    template: "%s | MeshySmith",
  },
  description:
    "MeshySmith is a free, open-source, local-first 3D design editor. Drop primitive shapes, fillet edges, cut holes with booleans, import STL, export STL or OBJ. Runs in the browser, Electron, or behind nginx. No account, no cloud lock-in.",
  applicationName: "MeshySmith",
  authors: [{ name: "f00d4tehg0dz", url: "https://github.com/f00d4tehg0dz" }],
  creator: "f00d4tehg0dz",
  publisher: "MeshySmith contributors",
  keywords: [
    "3D editor",
    "3D modeling",
    "browser 3D modeler",
    "local-first CAD",
    "Tinkercad alternative",
    "open source 3D design",
    "STL editor",
    "OBJ exporter",
    "fillet chamfer",
    "boolean operations",
    "Manifold 3D",
    "Three.js",
    "Next.js 3D",
    "fab lab software",
    "makerspace tools",
    "AGPL 3D editor",
    "Electron 3D modeler",
    "MeshySmith",
  ],
  category: "design",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "MeshySmith",
    title: "MeshySmith — Free local-first 3D editor for makers and classrooms",
    description:
      "Open-source 3D design editor with fillet, chamfer, boolean operations, and STL import/export. Runs in the browser, on the desktop, or in Docker. No account required.",
    locale: "en_US",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MeshySmith editor screenshot showing a 3D scene with a workplane, ViewCube, and shape palette",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeshySmith — Free local-first 3D editor",
    description:
      "Open-source 3D design editor. Fillet, chamfer, boolean ops, STL in/out. Browser, Electron, or Docker. No account.",
    images: ["/og-image.svg"],
    creator: "@f00d4tehg0dz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  other: { "theme-color": "#0098c7" },
};

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MeshySmith",
  applicationCategory: "DesignApplication",
  applicationSubCategory: "3D Modeling",
  operatingSystem: "Web, Windows, macOS, Linux",
  url: SITE_URL,
  downloadUrl: "https://github.com/f00d4tehg0dz/MeshySmith-3D/releases",
  softwareVersion: RELEASE_VERSION,
  datePublished: RELEASE_DATE,
  license: "https://www.gnu.org/licenses/agpl-3.0.en.html",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: {
    "@type": "Organization",
    name: "MeshySmith contributors",
    url: "https://github.com/f00d4tehg0dz/MeshySmith-3D",
  },
  featureList: [
    "Drop-shape modeling with 16 primitives across 5 categories",
    "Fillet and chamfer on box edges",
    "Boolean operations (solid + hole + intersect)",
    "Imports STL meshes",
    "Exports STL and OBJ",
    "Local-first: designs never leave the user's machine",
    "Light, dark, and system themes",
    "Fusion-style ViewCube with click-to-snap and drag-to-orbit",
    "Perspective and orthographic cameras",
    "Snap-to-grid with adjustable spacing and ruler tool",
    "Native Electron desktop app for Windows, macOS, and Linux",
    "Docker deployment for fab labs and classrooms",
  ],
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MeshySmith",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  sameAs: ["https://github.com/f00d4tehg0dz/MeshySmith-3D"],
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "MeshySmith", item: SITE_URL }],
};

function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const FEATURES = [
  { icon: Shapes, title: "16 primitives, 5 categories", body: "Basic, Curved, Polyhedra, Mechanical, and Type — including gears, capsules, torus knots, and extruded text." },
  { icon: Wand2, title: "Fillet and chamfer", body: "Round or bevel box edges with a smoothness control. Survives boolean operations and STL/OBJ export." },
  { icon: Layers, title: "Solid / hole booleans", body: "Mark any shape as a hole, group with solids to subtract. Boolean intersect is one click. Powered by Manifold." },
  { icon: Package, title: "STL in, STL or OBJ out", body: "Bring outside models in for further edits. Export selected shapes or the whole scene for 3D printing." },
  { icon: CircleDot, title: "Fusion-style ViewCube", body: "26 click zones (faces, edges, corners), drag-to-orbit, and a perspective / orthographic toggle." },
  { icon: Palette, title: "Light, dark, and system themes", body: "Crisp UI in any lighting. The 3D scene background, grid, and ViewCube all retheme together." },
];

const STEPS = [
  { icon: MousePointer2, title: "Drop a shape", body: "Open the Shapes menu, pick a category, search by name, then click or drag a primitive onto the workplane." },
  { icon: Wand2, title: "Edit, combine, hole", body: "Dial in dimensions in the inspector. Fillet edges, mark a shape as a hole, group to subtract, intersect to keep overlap." },
  { icon: Download, title: "Export and print", body: "Export the scene or your selection to STL or OBJ. Send the file to your slicer and print." },
];

const USE_CASES = [
  { icon: Hammer, title: "Makers and hobbyists", body: "Sketch parts, dial in fits, drop a hole for a bolt, send the file to your slicer. No project lock-in." },
  { icon: GraduationCap, title: "Classrooms", body: "No accounts, no subscriptions, no student data on a server. Self-host on the lab network in one Docker command." },
  { icon: Cpu, title: "Fab labs", body: "Designs stay in each user's browser; the container holds no project state. Restart, replace, or relocate at any time." },
];

const BUILT_WITH = [
  { name: "Next.js 16", url: "https://nextjs.org/" },
  { name: "React 19", url: "https://react.dev/" },
  { name: "Three.js", url: "https://threejs.org/" },
  { name: "Manifold", url: "https://github.com/elalish/manifold" },
  { name: "Electron 42", url: "https://www.electronjs.org/" },
  { name: "Tailwind CSS v4", url: "https://tailwindcss.com/" },
  { name: "shadcn/ui", url: "https://ui.shadcn.com/" },
];

const STATS = [
  { value: "16", label: "Primitives" },
  { value: "26", label: "ViewCube zones" },
  { value: "3", label: "Ship targets (Web · Desktop · Docker)" },
  { value: "0", label: "Required accounts" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareApplicationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }} />

      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        href="#main-content"
      >
        Skip to main content
      </a>

      <NavBar />

      <div id="main-content">
        <Hero />
        <About />
        <Features />
        <Pricing />
        <Footer />
      </div>
    </main>
  );
}

function NavBar() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight" aria-label="MeshySmith home">
          <img src="/assets/meshysmith/meshysmith-logo.png" alt="" width="32" height="32" className="rounded-md" />
          <span className="text-lg">MeshySmith</span>
        </Link>
        <nav aria-label="Primary" className="ml-auto hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <a href="https://github.com/f00d4tehg0dz/MeshySmith-3D" target="_blank" rel="noopener">
              <GithubIcon className="size-4" />
              <span>GitHub</span>
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href="/app">
              Open the editor
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(0,156,222,0.18),transparent_70%)]"
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            A 3D design editor that lives on{" "}
            <span className="bg-gradient-to-r from-primary to-[#3bb3f0] bg-clip-text text-transparent">
              your machine.
            </span>
          </h1>
          <p className="max-w-prose text-base text-muted-foreground sm:text-lg">
            MeshySmith is a fast, browser-and-desktop 3D modeller for makers, classrooms, and prototyping. Drop primitives, fillet edges, cut holes with booleans, import STL meshes, and export to STL or OBJ — without ever signing in.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="xl">
              <Link href="/app">
                Open the web editor
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <a href="https://github.com/f00d4tehg0dz/MeshySmith-3D/releases" target="_blank" rel="noopener">
                <Download className="size-4" />
                Download desktop app
              </a>
            </Button>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5"><Globe2 className="size-3.5" />Web · Windows · macOS · Linux</li>
            <li className="flex items-center gap-1.5"><Boxes className="size-3.5" />16 primitives, fillet &amp; chamfer</li>
            <li className="flex items-center gap-1.5"><Lock className="size-3.5" />No account, no telemetry</li>
            <li className="flex items-center gap-1.5"><GithubIcon className="size-3.5" />AGPL-3.0</li>
          </ul>
        </div>
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl"
          />
          <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <img src="/og-image.svg" alt="" loading="eager" decoding="async" className="block h-auto w-full" />
          </figure>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="border-b border-border" aria-labelledby="about-heading">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Badge variant="outline">About</Badge>
          <h2 id="about-heading" className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Tinkercad's loop, your machine.
          </h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">MeshySmith</span> is a free, open-source 3D design editor that runs entirely in your browser or as a native desktop app. It targets the satisfying loop popularised by Tinkercad — drop a shape, dial in dimensions, cut a hole, group it, export an STL — while staying <span className="font-semibold text-foreground">local-first</span> (designs never leave your machine), <span className="font-semibold text-foreground">open source</span> under AGPL-3.0, and <span className="font-semibold text-foreground">installable</span> as a real desktop binary for Windows, macOS, and Linux.
          </p>
          <p>
            No accounts, no cloud lock-in, no subscription. Self-host it for your fab lab in one Docker command, or just open the web editor and start designing.
          </p>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-b border-border bg-secondary/30" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <Badge variant="outline">Features</Badge>
          <h2 id="features-heading" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything you need for a fast 3D sketch.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Drop, fillet, hole, group, export. The MeshySmith editor is built around the high-traffic actions and gets out of the way the rest of the time.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="mt-3">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>{feature.body}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-b border-border" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <Badge variant="outline">Pricing</Badge>
          <h2 id="pricing-heading" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Free, forever.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            MeshySmith is open source under AGPL-3.0. There's no paid tier. Self-host it for your fab or classroom — just keep modifications open if you serve them over a network.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-md">
          <Card className="border-primary/40 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Open source</CardTitle>
                <Badge variant="default">AGPL-3.0</Badge>
              </div>
              <CardDescription>Everything in MeshySmith. No tiers, no upsell, no telemetry.</CardDescription>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold tracking-tight text-foreground">$0</span>
                <span className="text-sm text-muted-foreground">forever</span>
              </div>
            </CardHeader>
            <CardContent className="text-foreground">
              <ul className="space-y-2 text-sm">
                <PricingItem>16 primitives across 5 categories</PricingItem>
                <PricingItem>Fillet, chamfer, and boolean operations</PricingItem>
                <PricingItem>STL import, STL and OBJ export</PricingItem>
                <PricingItem>Fusion-style ViewCube + ortho mode</PricingItem>
                <PricingItem>Native desktop app (Win / macOS / Linux)</PricingItem>
                <PricingItem>Docker self-host bundle</PricingItem>
                <PricingItem>Light, dark, and system themes</PricingItem>
                <PricingItem>No account, no cloud, no telemetry</PricingItem>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/app">
                  Open the editor
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <a href="https://github.com/f00d4tehg0dz/MeshySmith-3D/releases" target="_blank" rel="noopener">
                  <Monitor className="size-4" />
                  Download desktop app
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden="true" className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6.5 L5 9 L10 3.5" />
        </svg>
      </span>
      <span className="text-foreground">{children}</span>
    </li>
  );
}

function Footer() {
  return (
    <footer role="contentinfo" className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <img src="/assets/meshysmith/meshysmith-logo.png" alt="" width="32" height="32" className="rounded-md" />
              <span>MeshySmith</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A local-first 3D design editor for makers, classrooms, and prototyping.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <a href="https://github.com/f00d4tehg0dz/MeshySmith-3D" target="_blank" rel="noopener">
                  <GithubIcon className="size-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
          <nav aria-label="Footer — product">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/app">Open the editor</Link></li>
              <li><a className="hover:text-foreground" href="#features">Features</a></li>
              <li><a className="hover:text-foreground" href="#pricing">Pricing</a></li>
            </ul>
          </nav>
          <nav aria-label="Footer — project">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Project</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a className="hover:text-foreground" href="https://github.com/f00d4tehg0dz/MeshySmith-3D" target="_blank" rel="noopener">Source on GitHub</a></li>
              <li><a className="hover:text-foreground" href="https://github.com/f00d4tehg0dz/MeshySmith-3D/issues" target="_blank" rel="noopener">Issues</a></li>
              <li><a className="hover:text-foreground" href="https://github.com/f00d4tehg0dz/MeshySmith-3D/discussions" target="_blank" rel="noopener">Discussions</a></li>
              <li><a className="hover:text-foreground" href="https://github.com/f00d4tehg0dz/MeshySmith-3D/releases" target="_blank" rel="noopener">Releases</a></li>
            </ul>
          </nav>
          <nav aria-label="Footer — resources">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Resources</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a className="hover:text-foreground" href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank" rel="noopener">AGPL-3.0 license</a></li>
              <li><a className="hover:text-foreground" href="/sitemap.xml">Sitemap</a></li>
              <li><a className="hover:text-foreground" href="/robots.txt">robots.txt</a></li>
              <li><a className="hover:text-foreground" href="/manifest.webmanifest">Web manifest</a></li>
            </ul>
          </nav>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} f00d4tehg0dz and MeshySmith contributors. Released under the GNU Affero General Public License v3.0 or later.
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">
            <span className="inline-flex items-center gap-1">
              <Gauge className="size-3" /> v{RELEASE_VERSION}
            </span>
            <span className="mx-2">·</span>
            <span className="inline-flex items-center gap-1">
              <Server className="size-3" /> No telemetry
            </span>
          </span>
        </p>
      </div>
    </footer>
  );
}
