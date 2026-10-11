MIND TRAILS WEBSITE
Prepared 11 October 2026 by Picknetic. picknetic@gmail.com, +48 795 918 033


WHAT IS IN THIS ARCHIVE

site      The finished website. Plain HTML, CSS and images. Ready to upload.
source    The project the site is built from. You need it only to change texts or photos.


HOW TO PUBLISH

Upload everything inside the "site" folder to the root of your hosting,
so that index.html sits at the top level of mindtrails.net.
No database, no PHP and no WordPress are needed. Any hosting works.

The HR presentation is included and opens at mindtrails.net/presentation/
The PDF version is at mindtrails.net/presentation/Mind-Trails-HR-Deck.pdf


THREE THINGS TO KNOW BEFORE YOU GO LIVE

1. The contact form.
   The form is built for Netlify. If you host the site on Netlify, enquiries
   arrive in your Netlify account with no extra work. On any other hosting
   the form will not send anything until a form handler is connected.
   The email address and the phone number on the page work everywhere.

2. Search engines.
   This version is open to Google. The preview version we showed you was hidden
   from search, this one is not. All page addresses are set to https://mindtrails.net

3. Tracking.
   Google Analytics, Tag Manager, the Meta pixel and the cookie banner are not
   installed in this version.


HOW TO CHANGE TEXTS AND PHOTOS

All texts of the page live in one file, source/src/data/site.js
Photos live in source/public/img

To rebuild the site after a change you need Node.js 22 or newer.
Open the "source" folder in a terminal and run

    npm install
    npm run build

The new version of the site appears in source/dist. Upload its contents the same way.
