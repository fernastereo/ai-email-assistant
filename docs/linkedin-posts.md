# Replie — LinkedIn Build in Public Posts

Series of 5 posts documenting the development journey leading up to the Chrome Web Store launch.
Each post follows the format optimized for LinkedIn: short lines, strong hook, CTA in body, link in first comment.

---

## Post 1 — Published ✅
**Theme:** Intro / reveal

> Already published. See first post for reference.

---

## Post 2 — Infrastructure
**Theme:** "It works on my machine" → real production backend
**When to publish:** ~1 week after Post 1

### Post text

```
"It works on my machine" is not a deployment strategy.

So I fixed that.

Here's how Replie's backend went from a local Node.js script
to a production API running 24/7:

→ Dockerized the Express backend (multi-stage build, non-root user)
→ Added Caddy as a reverse proxy — automatic SSL, zero config
→ Deployed to a $12/month Digital Ocean droplet
→ Set up GitHub Actions to build, push, and deploy on every push

Now every time I push to staging:
The Docker image builds.
Gets pushed to the container registry.
The server pulls it and restarts automatically.

No manual SSH. No "did it deploy?" anxiety.

The API is live at api.replie.email 🚀

Next: making the AI actually reply like a human.
That part was harder than I expected.

(Link to early access waitlist in the first comment 👇)
```

### First comment
```
Join the Replie waitlist here: replie.email
We're opening early access to a small group first.
```

### Image description
**Canvas:** 1200 x 627px, dark background (#0f0f0f)

**Layout — split in two:**
- **Left (55%):** Terminal or GitHub Actions screenshot showing a successful
  CI/CD pipeline run (green checkmarks). Place inside a clean dark window
  frame with a subtle drop shadow.
- **Right (45%):** Dark background with:
  - Small badge at top: `DEPLOYED` in green pill shape
  - Headline: `"From localhost to production."` — large, bold, white
  - Subtext: `"Automated. Every push."` — smaller, muted gray
  - Brand at bottom: `Replie` — white, medium weight

**Style:** Dark SaaS aesthetic, no gradients, Inter or Geist font.

---

## Post 3 — The AI Provider Problem
**Theme:** Tried 3 AI models before finding one that worked
**When to publish:** ~1 week after Post 2

### Post text

```
I tried 3 different AI models to power Replie.

The first two failed in ways I didn't expect.

Here's what happened:

Model 1 — OpenAI GPT-3.5
✅ Good quality replies
❌ Cost adds up fast at scale

Model 2 — Groq llama-3.1-8b (free tier)
✅ Blazing fast
❌ Ignored the language instruction (always replied in Spanish)
❌ Added a fake name as signature ("Best, Carlos")
❌ Assumed the user's gender incorrectly

Model 3 — Groq llama-3.3-70b
✅ Fast
✅ Follows instructions correctly
✅ Free tier
✅ Replies in the same language as the email

The problem wasn't the model. It was the prompt.

Small models need explicit instructions:
"Write the entire reply in German."
"Do not sign with a name."
"You are the RECIPIENT, not the sender."

The AI doesn't infer. You have to tell it everything.

14 prompt rewrites later — it finally works.

(Waitlist link in the first comment 👇)
```

### First comment
```
Try it when it launches: replie.email
Early access is limited — join the waitlist now.
```

### Image description
**Canvas:** 1200 x 627px

**Layout — three-column comparison card:**
- Dark background (#0f0f0f or #111827)
- Three vertical cards side by side, each representing one AI provider:
  - Card 1: "GPT-3.5" — yellow/amber accent — icon: dollar sign
  - Card 2: "Llama 8b" — red accent — icon: ✗ — label "Hallucinated"
  - Card 3: "Llama 70b" — green accent — icon: ✓ — label "Winner"
- Below the cards, small text: `"14 prompt rewrites later."`
- Brand at bottom right: `Replie`

**Style:** Dark, minimal, tech-card aesthetic. No stock photos.

---

## Post 4 — The Inline Toolbar (Core UX)
**Theme:** Almost built the wrong thing — scrapped the sidebar for inline toolbar
**When to publish:** ~1 week after Post 3

### Post text

```
I almost built the wrong feature.

My original plan: a Chrome sidebar that opens next to Gmail.
You'd read the email, open the sidebar, generate a reply,
copy it, switch back, paste it.

I built it. It worked.

Then I actually used it for a week.

The copy-paste alone was killing the whole point.

So I scrapped it.

Instead, Replie now injects a small toolbar
directly below each email in Gmail.

Select your tone.
Click generate.
The reply appears in the compose box automatically.

No sidebar. No copy-paste. No tab switching.
Just: read → click → send.

The best UX is the one that gets out of the way.

(Waitlist link in the first comment 👇)
```

### First comment
```
See it in action and join the waitlist: replie.email
```

### Image description
**Canvas:** 1200 x 627px

**Layout — before / after split:**
- **Left half:** Labeled `BEFORE` in small red badge at top
  - Rough wireframe/sketch-style illustration of a browser with a
    sidebar panel open next to Gmail. Arrows showing: email → sidebar →
    copy → paste → back to Gmail. Looks complex and cluttered.
- **Right half:** Labeled `AFTER` in small green badge at top
  - Real screenshot of Replie's inline toolbar appearing directly
    below an email in Gmail (use the actual extension screenshot).
    Arrow pointing to the toolbar with label: "lives right here."
- **Center divider:** Thin vertical line with `VS` in the middle
- Brand at bottom: `Replie`

**Style:** Left side slightly desaturated/grayed out. Right side bright and clean.

---

## Post 5 — Pre-Launch
**Theme:** What's done, what's left, building anticipation for Chrome Web Store
**When to publish:** When Chrome Web Store submission is ready / imminent

### Post text

```
Replie is almost ready to launch on the Chrome Web Store.

Here's what it took to get here:

✅ Chrome extension with inline Gmail toolbar
✅ Multi-provider AI backend (OpenAI, DeepSeek, Groq)
✅ Automatic language detection — replies in your email's language
✅ Tone selection: formal, casual, concise, persuasive
✅ Summarize any email in 3 bullets
✅ Production API with automated deploys
✅ Rate limiting — 20 free replies/day
✅ Privacy policy + landing page

What's left before launch:
→ Chrome Web Store review (1-5 business days)
→ Final QA on edge cases
→ That's it.

If you're on the waitlist, you'll get early access first.
If you're not — now is the time.

Building this solo over the last few months
has been the most I've learned in a long time.

More updates coming soon. 🚀

(Waitlist link in the first comment 👇)
```

### First comment
```
Join the waitlist before we open to the public: replie.email
Early access users get priority support + influence the roadmap.
```

### Image description
**Canvas:** 1200 x 627px

**Layout — checklist / progress card:**
- Dark background (#0f0f0f)
- Large centered card with:
  - Header badge: `LAUNCHING SOON` in purple/violet pill
  - Title: `"Replie is almost here."` — large, bold, white
  - Two-column checklist below:
    - Left column: completed items (green checkmark icons)
    - Right column: remaining items (clock/hourglass icons, muted)
  - Progress bar at bottom of card: ~90% filled, accent color
- Brand at bottom: `Replie` + `replie.email` in small muted text

**Style:** Clean, product launch aesthetic. The progress bar should feel
satisfying — almost complete but not quite.

---

## Notes

- **Frequency:** 1 post per week keeps momentum without burning the audience
- **Always put the link in the first comment**, never in the post body (LinkedIn penalizes external links in posts)
- **Engage with every comment** in the first 60 minutes after posting — the algorithm rewards early engagement velocity
- **Hashtags to use consistently:** `#BuildInPublic #ChromeExtension #AI #Productivity #SideProject #IndieHacker`
- **Best time to post:** Tuesday–Thursday, 8–10am or 12–1pm in your audience's timezone
