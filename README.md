# Renexa Studio — landing page

Static HTML/CSS/JS, no build step, no framework, no CMS. Two full page
versions: English at `/index.html`, Spanish at `/es/index.html`, linked
via the EN | ES switcher in the header.

## Structure

```
index.html        English homepage
es/index.html      Spanish homepage
css/style.css       shared styles (design tokens at the top)
js/main.js          mobile nav toggle, scroll-reveal, form validation
fonts/               self-hosted Outfit variable font (headings only)
thank-you.html      Netlify Forms success page (English)
gracias.html        Netlify Forms success page (Spanish)
favicon.svg
netlify.toml
```

## Before going live

1. **Replace placeholder contact info.** `hello@renexastudio.com` and
   `(919) 555-0142` appear in both pages (header is unaffected, they're
   only in the contact section and footer) and must be swapped for the
   real business email/phone. Search both HTML files for
   `renexastudio.com` and `555-0142`.
2. **Confirm the business name.** "Renexa Studio" is a placeholder per
   the brief; update the `<title>`, `.brand` text (appears twice per
   page: header and footer), and `og:title`/`og:description` once a
   final name is chosen.
3. **Swap the canonical domain.** `https://www.renexastudio.com/` in
   the `<link rel="canonical">` and `hreflang` tags in both pages'
   `<head>` should match the real domain once purchased.
4. **Example section image.** The "Example of work" mockup pulls a
   placeholder photo from `picsum.photos` (a stock-photo placeholder
   service) — swap the `background-image` URL in `.example-hero`
   (both language files) for a real project photo once you have one.

## Contact form (Netlify Forms)

The form already has `data-netlify="true"` and a honeypot field, which
is all Netlify needs — no signup, no API key, no backend. It only
works once the site is actually deployed on Netlify (it does nothing
on a plain local preview or on Vercel).

If you deploy to Vercel instead, swap the form for
[Formspree](https://formspree.io): remove `data-netlify` and
`netlify-honeypot`, and set `action="https://formspree.io/f/YOUR_ID"`
on both `<form>` tags.

## Deploying

**Netlify:** drag-and-drop the whole folder onto
[app.netlify.com/drop](https://app.netlify.com/drop), or connect the
git repo (no build command needed, publish directory is `.`).

**Vercel:** `vercel deploy` from this folder, or connect the repo (no
framework preset, no build command).

**GitHub Pages:** this repo is set up to deploy straight from the
`main` branch root, no build step, no Actions workflow. All asset
links are relative (`css/style.css`, not `/css/style.css`) specifically
so the site still works when served from a subpath like
`https://USERNAME.github.io/renexa-studio/` instead of a domain root.
If you later attach a custom domain to Pages (via a `CNAME` file plus
DNS), those relative links keep working unchanged. One catch: **GitHub
Pages has no form backend**, so `data-netlify="true"` does nothing
there. Swap the contact form for
[Formspree](https://formspree.io) (see below) if Pages is the
permanent home, or keep Pages just for preview and move to Netlify for
the real launch so the built-in form works.

## Editing content later

There's no admin panel by design (per the brief — static files only).
To change text, open the relevant `index.html` in a text editor and
edit directly; both language files need the same edit made twice
since they don't share content, only `css/style.css` and `js/main.js`.
