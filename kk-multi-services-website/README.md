# KK Multi Services — Website

Static, responsive one-page website for **KK Multi Services** (Balewadi, Pune), built from the brand brochure and https://kk-multi-services.vercel.app.

## Stack
- HTML5 (semantic landmarks, schema.org `LocalBusiness` JSON-LD, Open Graph)
- Bootstrap 5.3 (grid, off-canvas mobile menu, floating-label forms, scrollspy)
- Material Symbols Rounded (Google's Material UI icon set)
- Plus Jakarta Sans font
- Vanilla JS, no build step

## Structure
```
kk-multi-services-website/
├── index.html
├── assets/
│   ├── css/style.css     # brand tokens (navy #0A1931 / teal #17A398), components, animations
│   ├── js/main.js        # header state, scroll reveal, counters, ripple, form → WhatsApp
│   └── img/              # logo.svg + photos taken from the brochure
└── README.md
```

## Sections
Hero · Services marquee · About (animated stats) · Services · Why Choose Us · How It Works (animated timeline) · Who We Serve · Our Work gallery · Testimonials · Stats band · Contact (form + Google Map) · Footer · Floating WhatsApp / Call / Back-to-top buttons.

## Animations
Ken Burns hero image, glowing gradient orb, rotating service text, scroll-reveal (fade/slide/zoom with stagger), count-up numbers, timeline line draw, card hover effects, Material ripple on buttons, infinite marquee, pulsing WhatsApp button, scroll progress bar. Motion is turned off when the visitor has `prefers-reduced-motion` enabled.

## Run
Open `index.html` in a browser, or serve the folder:
```
npx serve .
```
Deploy by dragging the folder to Vercel or Netlify.

## Customize
- **Contact form**: sends a pre-filled WhatsApp message to `+91 7276748645`. Change `WHATSAPP_NUMBER` in `assets/js/main.js`.
- **Social links**: the Facebook / Instagram / LinkedIn links in the footer are `#` placeholders. Replace them with the real profile URLs.
- **Colors**: edit the `--kk-*` variables at the top of `assets/css/style.css`.
