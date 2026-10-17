# DESIGN.md: Lê Phục Sinh Portfolio

Theme: dark, cinematic minimalism. Structural reference: Apple product pages (Refero style "Apple iPhone 18 Pro"). Palette and accent logic: this brief, not Apple's.
Stack: Next.js (App Router) + Tailwind v4 + Supabase (DB and Storage) + Vercel.
UI language: Vietnamese. Code, comments, identifiers: English.

## 1. Readers and the job of this site

Two readers, two time budgets.

| Reader | Time | Needs to find |
|---|---|---|
| HR screener | 30 to 60 seconds | Target role, years of experience, industries, location, CV download, contact. Keywords must match the job description |
| Business hiring manager | 3 to 5 minutes | Business problem, ownership, constraints, metric with baseline, what the candidate would do differently |

Rules that follow from this:

* First viewport answers "who, what role, what proof, how to get the CV" without scrolling.
* Every keyword (Omnichannel, HCP Journeys, CDP, Next-Best-Action, Closed-loop Analytics, Medical Compliance) is real DOM text. Never inside images, canvas or video.
* Every case page opens with a one-line result and a meta strip before any story.
* Credibility beats spectacle. No metric appears without baseline, period and scope.

## 2. Design principles

1. One memorable thing: the data flow line on case pages (a single SVG path that lights up stage by stage as the reader scrolls). Everything else stays quiet.
2. Flat surfaces. Layers are separated by tone and 1px keylines, not shadows.
3. Emerald means "interactive or growth". Gold means "ROI figure". Neither is decoration.
4. Section names are never printed as labels. Each section opens with a sentence that states its insight.
5. Motion budget: hero entrance (once), KPI count-up (once per element), data flow line (once). Hover and focus responses are allowed because they answer the reader's action. No fade-and-slide on every section.

## 3. Color tokens

```css
@theme {
  /* Surfaces */
  --color-stage: #0A0F1D;      /* page background, hero */
  --color-panel: #0F172A;      /* cards, panels */
  --color-raised: #162033;     /* nested elements, inputs */
  --color-line: #1E293B;       /* default 1px keyline */
  --color-line-strong: #2B3A55;/* hover keyline, dividers on panels */

  /* Text */
  --color-text: #F1F5F9;       /* primary, never pure white */
  --color-text-2: #94A3B8;     /* body copy, supporting text */
  --color-text-3: #7D8BA3;     /* captions, metadata (verify contrast >= 4.5:1) */

  /* Accent */
  --color-emerald: #10B981;    /* links, CTA, focus ring, growth deltas */
  --color-teal: #0D9488;       /* lines, fills, secondary charts */
  --color-gold: #F59E0B;       /* ROI and revenue figures only */
  --color-on-emerald: #04130D; /* text on emerald buttons (white fails contrast) */

  /* Semantic */
  --color-danger: #F87171;     /* form errors only */
}
```

Usage rules:

* Emerald fills only the primary CTA. Everywhere else it appears as text, line, focus ring or glow.
* Gold appears only on figures that represent money or ROI. If a card has both emerald and gold, gold wins the number, emerald wins the delta arrow.
* No gradients except the glow in section 7 and one stage fade from `--color-stage` to `--color-panel` behind the hero.
* Contrast: body and metadata at least 4.5:1, large text at least 3:1. Verify `--color-text-3` with a checker before shipping.

## 4. Typography

Family: Inter (variable). Load with `next/font` and include the Vietnamese subset.

```ts
import { Inter } from "next/font/google";
export const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-sans",
});
```

Stack: `var(--font-sans), "SF Pro Display", ui-sans-serif, system-ui, sans-serif`.
Numbers in KPIs and tables: `font-variant-numeric: tabular-nums`.

Vietnamese diacritics caution: stacked tone marks clip at tight line heights. Display line-height never goes below 1.1, and display tracking never goes tighter than -0.025em.

| Role | Size (desktop / mobile) | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| display-xl | clamp(56px, 8vw, 96px) | 600 | 1.1 | -0.025em | Hero name only |
| display | clamp(44px, 6vw, 80px) | 600 | 1.1 | -0.025em | Case page title |
| h1 | clamp(36px, 4.4vw, 56px) | 600 | 1.12 | -0.02em | Section insight sentence |
| h2 | clamp(28px, 3vw, 40px) | 600 | 1.18 | -0.015em | Sub sections |
| h3 | 28px / 24px | 600 | 1.25 | -0.01em | Card titles |
| metric | clamp(40px, 5vw, 64px) | 600 | 1.0 | -0.02em | KPI numbers, tabular |
| lead | 20px / 18px | 400 | 1.5 | 0 | Intro paragraphs |
| body | 17px / 16px | 400 | 1.6 | 0 | Case story text, max 68ch |
| body-sm | 15px | 400 | 1.55 | 0 | Card descriptions |
| caption | 13px | 500 | 1.4 | 0.01em | Metadata, units. Sentence case, never all caps |

## 5. Layout, spacing, shape

* Spacing base 8px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 144.
* Container: max 1200px, side padding 24px mobile, 48px desktop.
* Section vertical padding: `clamp(96px, 12vw, 160px)`.
* Grid: 12 columns, gap 16px.
* Radius: card 28px desktop and 20px mobile, media frame 28px, input 14px, button 999px, nav container 20px.
* Cards have no box-shadow at rest.

## 6. Page structure

Navigation (sticky, blur backdrop, 56px): Giới thiệu, Dự án, Chiến lược, Liên hệ, and a primary button "Tải CV". Merge the old "Dự án" and "Case study" into one section. Chứng chỉ is a compact row inside Giới thiệu, not a menu item.

Home, in order:

1. Hero
2. Proof strip (3 to 4 verified numbers)
3. Capabilities (nine items as a quiet two-column list, not nine cards)
4. Bento grid of projects
5. Strategy documents (PDF via signed URL)
6. Contact

### Hero (the 10 second HR test)

```
[ name, display-xl ]
[ Omnichannel Marketing Lead cho Healthcare và Biotech, lead ]
[ one sentence: the business problem solved, body ]

[ Tải CV (PDF) ]  [ Xem dự án ]

Vị trí mục tiêu | Ngành | Kinh nghiệm | Địa điểm | Sẵn sàng
Senior Omnichannel | Dược, Biotech | [REPLACE: years] | TP.HCM | [REPLACE]
```

* Left aligned. Video or image sits behind at low opacity on the right, never behind the text block.
* Facts row is real text in a `<dl>`, so ATS and screen readers read it.
* "Tải CV" must point to a real signed PDF URL. Never `#contact`.

### Bento grid (12 columns, 6 cards)

```
+-----------------------+-----------+
|  A  flagship (7x2)    | B (5x1)   |
|                       +-----------+
|                       | C (5x1)   |
+-------------+---------+-----+-----+
| D (4x1)     | E (4x1)       | F   |
+-------------+---------------+-----+
```

* A, B, C are the three flagship case studies. D, E, F are secondary projects. Each one opens its own page.
* Card content order: sector tag, title (h3), one-line result, two metrics. The result precedes the story.
* Mobile: single column, flagships first, then the rest.
* Rule: a card's metrics must equal the metrics on its destination page. Enforced by reading both from the same database row.

### Case page (no printed section names)

Order and the insight sentence each section opens with:

1. Meta strip: role, duration, channels, partners. Then a one-line result and two metrics.
2. Context and challenge: states the business problem and the constraint.
3. Objective: states the target as a measurable sentence.
4. Solution and execution: includes the data flow line and diagrams.
5. Results: metrics with baseline, period, scope. Includes one honest limitation.
6. Lessons: what would be done differently.
7. Other projects: two cards.

Implement each section with `<section aria-labelledby>` pointing at its h1 or h2 sentence, so structure stays semantic while no label like "Bối cảnh" is printed.

## 7. Components and the reconciled hover

Apple forbids shadows and gradients; this brief asks for a glow. Reconciliation: the card stays flat, and only the keyline lights up under the pointer. The glow is confined to the 1px border plus a very faint ambient halo.

```css
.bento-card {
  position: relative;
  border-radius: var(--radius-card, 28px);
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  transition: border-color 240ms cubic-bezier(.2,.8,.2,1),
              box-shadow 240ms cubic-bezier(.2,.8,.2,1);
}

/* Border-only glow that follows the pointer */
.bento-card::before {
  content: "";
  position: absolute;
  inset: -1px;
  padding: 1px;
  border-radius: inherit;
  background: radial-gradient(
    320px circle at var(--mx, 50%) var(--my, 0%),
    rgb(16 185 129 / .55),
    transparent 60%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  opacity: 0;
  transition: opacity 240ms cubic-bezier(.2,.8,.2,1);
  pointer-events: none;
}

@media (hover: hover) {
  .bento-card:hover {
    border-color: var(--color-line-strong);
    box-shadow: 0 16px 56px -24px rgb(16 185 129 / .16); /* ambient, max alpha .16 */
  }
  .bento-card:hover::before { opacity: 1; }
  .bento-card:hover .bento-cover { transform: scale(1.02); }
}

/* Touch and keyboard: no hover, so respond to focus and press */
.bento-card:focus-visible::before,
.bento-card:active::before { opacity: 1; }
.bento-card:focus-visible { outline: 2px solid var(--color-emerald); outline-offset: 3px; }

.bento-cover { transition: transform 400ms cubic-bezier(.2,.8,.2,1); }
```

Pointer tracking:

```ts
function onPointerMove(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}
```

Other components:

| Component | Spec |
|---|---|
| Primary button | Emerald fill, `--color-on-emerald` text, 999px radius, 44px min height. Hover: lighten 6%. Focus: 2px emerald ring, 3px offset |
| Secondary button | Transparent, 1px `--color-line-strong`, text `--color-text`. Hover: border emerald at 50% |
| Text link | Emerald, underline on hover. No arrow glyph appended to text; show a small icon on hover instead |
| Input | `--color-raised` fill, 1px `--color-line-strong`, 14px radius. Focus: 1px emerald border and 2px outer ring at 30% alpha |
| Metric block | Number in metric style, caption below with unit and baseline. Gold for ROI, text color for everything else |
| Evidence note | 13px caption in `--color-text-3` directly under a metric: period and scope, for example "Toàn bộ kênh trả phí, 2 quý" |

## 8. Motion

| Moment | Spec |
|---|---|
| Hero entrance | One sequence, 600ms, opacity and 12px translate, plays once |
| KPI count-up | Starts when 40% visible, 1200ms easeOutCubic, once per element. The final value is in the server-rendered HTML, so no-JS, ATS and print show the truth |
| Data flow line | SVG path with `stroke-dashoffset` bound to scroll progress inside the solution section. Nodes switch from `--color-line-strong` to emerald as the line passes. Plays once, stays lit |
| Hover and focus | Section 7. 240ms |
| Reduced motion | `prefers-reduced-motion: reduce` shows final states, no count-up, no line animation, no video autoplay |

## 9. Content contract (prevents the percent versus percentage point error)

Metrics are data, not strings. Store them structured so the UI cannot print an ambiguous claim.

```ts
type Metric = {
  value: number;
  unit: "pct" | "pp" | "x" | "index" | "count" | "days";
  direction: "up" | "down";
  baseline?: string;   // "31%" 
  period: string;      // "2 quý"
  scope: string;       // "Toàn bộ kênh trả phí"
  kind?: "roi" | "ops" | "growth";  // gold only when "roi"
  verified: boolean;
};
```

* `unit: "pp"` renders as "+46 điểm phần trăm", never "+46%".
* If `verified` is false in production, the site shows a small "Số liệu minh họa" caption on that metric. The build logs a warning listing every unverified metric.
* Banned: template claims such as "500+ brands", "1.2K campaigns", "75% average ROI". Remove all agency boilerplate.
* One honest limitation per case, one lesson per case.
* Copy: sentence case, active voice, plain Vietnamese. Name things as the reader understands them ("Chi phí mỗi đơn hàng"), not by system.

Supabase shape (minimal):

| Table | Key fields |
|---|---|
| case_studies | slug, sector, title, summary, role, duration, channels text[], partners text[], cover_url, sort_order, tier ("flagship" or "secondary"), is_published |
| case_sections | case_id, kind (context, objective, solution, results, lessons), heading, body (markdown), media jsonb |
| case_metrics | case_id, position, Metric fields above |

* Storage bucket `portfolio`: public for cover and diagram images. PDFs in a private bucket, served by signed URL with 5 minute expiry, optionally gated by an email field (this also captures a lead).
* RLS: anonymous read where `is_published = true`. Write only for the owner account.
* Card and page both read from `case_metrics`, so numbers can never diverge.

## 10. Protection (decision record)

Blocking F12, right click or screenshots is not implemented. It cannot stop OS screenshots or phone cameras, it breaks text selection and screen readers, and it signals distrust to a pharma recruiter. Protection that works instead:

* Anonymize and round all data. Publish nothing under NDA.
* Authorship line in the footer: "Toàn bộ nội dung thuộc quyền sở hữu của Lê Phục Sinh. Không sao chép hoặc sử dụng lại khi chưa có sự đồng ý bằng văn bản."
* Faint diagonal watermark on dashboard and diagram images.
* Strategy PDFs via signed URL only.
* Contact form: honeypot field plus Cloudflare Turnstile, server-side rate limit, validate on the server.
* Email address obfuscated or replaced by a form-open button.
* Security headers in `next.config`: Content-Security-Policy, Referrer-Policy `strict-origin-when-cross-origin`, X-Content-Type-Options `nosniff`, frame-ancestors `none`.
* Production build: source maps off.

## 11. Performance and accessibility floor

* Hero video: under 4 MB, `muted playsinline`, `poster` set, `preload="metadata"`, replaced by the poster on `prefers-reduced-motion` and `saveData`. Confirm the video license before launch.
* Images through `next/image` with explicit dimensions. LCP element is the hero text or poster, never a late-loading video.
* Targets: LCP under 2.5s on mobile 4G, CLS under 0.05.
* Skip link, landmarks, visible focus ring on every interactive element, tap targets at least 44px.
* Open Graph and Twitter images exist for the home page and every case page.

## 12. Do and don't

Do

* Put the result before the story on every card and page.
* Keep body copy at 68 characters per line or less.
* Use tone and 1px lines to separate surfaces.
* Let one element be the memorable one: the data flow line.

Don't

* Print section labels such as "Who Am I" or "Case study nổi bật".
* Use all caps labels, numbered markers on non sequential content, or a glyph arrow after every link.
* Use pure white text, pure black backgrounds, or one radius on every element.
* Use gold anywhere except ROI figures.
* Show any statistic without baseline, period and scope.
* Link anything to "#". Hide the element until the real URL exists.

## 13. Acceptance checklist

1. A stranger can state the role, industry and years of experience within 10 seconds on a phone.
2. "Tải CV" downloads a real PDF.
3. Each bento card's metrics match its destination page exactly.
4. No visible section labels. No template claims. No dead links.
5. Every unit is correct (percent, percentage point, index, multiple).
6. Keyboard only: all cards and buttons reachable with a visible focus ring.
7. Reduced motion shows final states with nothing animating.
8. Lighthouse mobile: performance 90 or above, accessibility 95 or above.
9. Each case page contains one limitation and one lesson.
10. Contact form rejects bots and does not expose personal data in client code.
