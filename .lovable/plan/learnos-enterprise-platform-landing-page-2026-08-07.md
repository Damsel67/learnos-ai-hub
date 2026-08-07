# LearnOS — Enterprise Platform Landing Page

Keep the existing design language (midnight navy + violet/mint tokens, Inter + Instrument Serif, rounded cards, soft shadows, light/dark toggle). No visual reset — this expands the page into a full enterprise story with more sections, more depth, and motion.

## Navigation

Replace links with: Platform, Solutions, AI Features, Resources, Enterprise, Demo, Login. Keep the theme toggle and the "Get Started" button. Mobile: add a slide-down glass menu (currently links are hidden entirely under md).

## Hero

- Headline: "The AI Operating System for Modern Education"
- Subheadline: the full platform sentence covering classrooms, courses, AI assistants, scheduling, assessments, parent communication, automation and analytics.
- Buttons: Start Free (gradient primary) / Book a Demo (glass outline).
- Trust line under the buttons plus a muted row of placeholder institution names.

### Hero graphic

Replace the single fake dashboard with a three-panel layered showcase:

```text
 [Student Dashboard]   [ LIVE CLASSROOM ]   [Admin Dashboard]
      tilted back         front, larger        tilted back
        overlapping edges, glass, glow behind
```

- Middle panel: video tile grid, live badge, whiteboard strip, participant rail.
- Side panels: progress rings/bars (student), KPI tiles + chart (admin).
- Glassmorphism via Tailwind backdrop utilities (no hand-written -webkit prefixes).
- Floating AI notification chips animating in on a loop around the stack: AI detected learner distraction, Attendance completed automatically, Homework generated, Parent notified, Quiz graded automatically.
- Subtle parallax on mouse move (desktop only), disabled under reduced motion.

## New / rebuilt sections (in page order)

1. **Everything in One Platform** — 9-card bento-ish grid, each card = icon, title, and its feature list as small pill tags: Live Classrooms, AI Classroom Intelligence, Learning Management, Assessment Engine, Communication Hub, Smart Scheduling, Parent Portal, Admin Console, Analytics.
2. **Built for Every Role** — 6 cards (Student, Tutor, Parent, School Administrator, Operations Team, Finance Team), each with a small realistic mock dashboard preview built from the existing Row/Stat/Progress primitives.
3. **AI Features** — floating, gently drifting cards for the 8 AI capabilities on an animated gradient field.
4. **Why Schools Choose LearnOS** — animated counting statistics grid (uptime, workflows, monitoring, events, timezones, classrooms, security, SOC2).
5. **Compare LearnOS** — responsive comparison table, columns Zoom / Google Classroom / MeritHub / LearnOS across 11 rows, LearnOS column highlighted with full check marks. Horizontal scroll on mobile.
6. **Testimonials** — cards from a school owner, tutor, parent and student with profile photos.
7. **FAQ** — accordion covering pricing, security, data, AI, schools, tutors, migration, support.
8. **How It Works** and **CTA** stay, lightly restyled for the new spacing rhythm.

## Footer

Four columns — Products, Company, Resources, Legal — with the listed links, brand block, socials, and bottom bar.

## Design pass

More vertical whitespace, glass surfaces, hover lift/glow on every card, animated gradient background blobs, scroll-reveal via Motion, micro-interactions, premium shadows. Fully responsive; both themes verified.

## Technical notes

- Add the `motion` package (Motion for React) for scroll reveals, hero parallax, floating chips and counters; all animations respect `prefers-reduced-motion`.
- New components under `src/components/landing/`: `HeroShowcase`, `PlatformGrid`, `Roles`, `AIFeatures`, `Stats`, `Comparison`, `Testimonials`, `FAQ` (shadcn accordion), plus rewrites of `Hero`, `Navbar`, `Footer`, `Features` → replaced by `PlatformGrid`, `DashboardPreview` → replaced by `Roles`.
- Testimonial portraits generated as image assets and imported directly.
- New glass/glow/animated-gradient utilities added as tokens in `src/styles.css` for both `.dark` and `.light`; no hardcoded color classes in components.
- Update the route `head()` title/description to match the new positioning.
