MIND TRAILS WEBSITE
Updated 9 November 2026 by Picknetic. picknetic@gmail.com, +48 795 918 033


WHAT CHANGED SINCE THE 11 OCTOBER VERSION

1. Three sections now show the current Mind Trails graphics on phones and
   tablets too. What you will not find at Mind Trails, One experience.
   Something for every mind, and How Mind Trails draws people in.
   The old text layout that replaced them below 900 px is removed.
   On a phone, tap a graphic to open it full size and swipe sideways to read it.

2. Google Tag Manager GTM-PDHN79DT is added at the top of the head of the
   home page and of /presentation/. The snippet is the one from Google's
   current installation guide, with no second loader.

3. Nothing else changed. This archive starts from mindtrails.net as it was
   live on 9 November 2026, so it keeps your AWS contact form exactly as it is.
   Same backend address, same hCaptcha site key, same field names, same
   success and error messages. The old Netlify form is not in this archive.
   The email address is contact@mindtrails.net, as on the live site.


CHANGED FILES

site/index.html
site/_astro/index.NvgIQjm7.css            new file
site/presentation/index.html

All images, robots.txt, sitemap.xml and the HR presentation PDF are the same
files that are live now. The old file site/_astro/index.CPMWFHnp.css is no
longer used by the new index.html. Keeping it on the server does no harm.


BEFORE YOU UPLOAD

- Make a backup of the current site files first.
- Do not change the AWS backend, API Gateway, hCaptcha or Cloudflare settings.
  This archive does not need any change there.
- Keep your current server and Cloudflare headers as they are.
  We saw no Content Security Policy on mindtrails.net on 9 November 2026.
  If you have one or add one later, it has to allow
  https://www.googletagmanager.com for scripts, or Tag Manager will not load.
- The email address is plain text in these files. Cloudflare hides it from
  bots on the fly, the same way it does now.


HOW TO PUBLISH

Upload the three changed files listed above to the same place as now,
or upload everything inside the "site" folder, so that index.html stays at
the top level of mindtrails.net. No database and no PHP are needed.

After upload, please open mindtrails.net on a phone and send one real test
enquiry through the form, so we know the form still reaches your inbox.


ABOUT ANALYTICS

Tag Manager is installed, but on 9 November 2026 the published version of
GTM-PDHN79DT is an empty container with no tags. It collects nothing and sets
no cookies until a Google Analytics 4 tag is added and published inside
Tag Manager. There is no cookie banner on the site. Cookie consent for
visitors in Poland and the EU should be agreed before that GA4 tag goes live.


HOW TO CHANGE TEXTS AND PHOTOS

All texts of the page live in source/src/data/site.js
The contact form code is at the bottom of source/src/pages/index.astro
Tag Manager is in source/src/layouts/Base.astro

To keep this archive small, the images and the HR presentation are stored
only once, in the "site" folder. Before you rebuild, copy them into the
source project.

    copy  site/img           to  source/public/img
    copy  site/presentation  to  source/public/presentation

Then, with Node.js 22.12 or newer, open the "source" folder in a terminal and run

    npm install
    npm run build

The new version appears in source/dist. We checked that this build gives
the same form code as the live site, byte for byte.
