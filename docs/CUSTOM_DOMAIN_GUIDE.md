# Custom Domain Configuration Guide
### Department of Internet of Things and Robotics Engineering (IRE), UFTB

This guide explains how to connect a custom domain or university subdomain (such as `routine.ire.uftb.ac.bd` or `ireroutine.com`) to this application.

---

## 1. Subdomain from University (`routine.ire.uftb.ac.bd`)
If you request a subdomain from the UFTB IT Center or Department Web Administrator:

### If deployed on Vercel:
1. Go to your **Vercel Project Dashboard** → **Settings** → **Domains**.
2. Enter the domain: `routine.ire.uftb.ac.bd` and click **Add**.
3. Vercel will display the recommended DNS record:
   - **Type:** `CNAME`
   - **Name / Host:** `routine`
   - **Target / Value:** `cname.vercel-dns.com`
4. Provide this `CNAME` record to the university domain administrator.
5. Once added in the DNS panel, SSL certificate (HTTPS) will automatically issue within 5–10 minutes.

### If deployed on Cloudflare Pages:
1. Go to **Cloudflare Dashboard** → **Workers & Pages** → Your Project → **Custom Domains**.
2. Click **Set up a domain** and type: `routine.ire.uftb.ac.bd`.
3. Add the DNS CNAME record pointing to your `*.pages.dev` address.

---

## 2. Independent Custom Domain (e.g. `ireroutine.com`)
If you purchase an independent domain from Namecheap, Porkbun, or Cloudflare Registrar:

1. Add your project in **Vercel** or **Cloudflare**.
2. Set DNS Records:
   - **Root Domain (`@`):**
     - Type: `A`
     - Value: `76.76.21.21` (for Vercel)
   - **Subdomain (`www`):**
     - Type: `CNAME`
     - Value: `cname.vercel-dns.com`
3. Vercel automatically manages automatic HTTPS SSL renewal (Let's Encrypt).

---

## 3. PWA Manifest & Service Worker Verification
Once the custom domain is active:
- The Progressive Web App (PWA) manifest (`public/manifest.json`) and service worker will automatically bind to the new origin.
- Users can click **Install App** to add the icon directly to their mobile home screen with zero browser URL bar.
