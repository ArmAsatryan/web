# Deploy to Cloudflare Pages (ballistiq.xyz)

## Fix “infinite build”

The build must **finish** and produce static files. Do **not** use `npm run dev` (that starts a server and never exits).

### In Cloudflare dashboard

1. Go to **Workers & Pages** → your project → **Settings** → **Builds & deployments**.
2. Under **Build configurations** → **Build command**, set:
   - **Build command:** `npm run build`  
     (or `bash build.sh`)
3. Set **Build output directory:** `dist/public`

Save. Redeploy. The build should complete and your site will be live.

---

## Custom domain (ballistiq.xyz)

1. In your Pages project go to **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter `ballistiq.xyz` (and optionally `www.ballistiq.xyz`).
4. If the domain is **on Cloudflare**: DNS is set up automatically.
5. If the domain is **elsewhere**: add the CNAME target Cloudflare shows (e.g. `your-project.pages.dev`) at your DNS provider for `ballistiq.xyz` (and `www` if you use it).

After DNS propagates, the site will be served at **https://ballistiq.xyz**.

---

## Summary

| Setting              | Value            |
|----------------------|------------------|
| Build command        | `npm run build`  |
| Build output dir     | `dist/public`    |
| Root directory       | (leave default)  |
