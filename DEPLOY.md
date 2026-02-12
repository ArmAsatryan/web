# Deploy to Cloudflare Pages (ballistiq.xyz)

## Deploy command (fix "run wrangler pages deploy instead")

Set **Deploy command** to: `npx wrangler pages deploy dist/public`  
Do **not** use `npx wrangler deploy` (Workers) — use **pages deploy**.

---

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

## Fix "Authentication error [code: 10000]" (API token permissions)

If deploy fails with **Authentication error [code: 10000]**, the token in **CLOUDFLARE_API_TOKEN** does not have permission to deploy to Pages. Use a **Custom** token with the right permissions.

### Create a token that works

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Click **Create Token** → choose **Create Custom Token** (do not use a preset).
3. **Permissions:**
   - **Account** → **Cloudflare Pages** → **Edit**
4. **Account resources:** **Include** → **Your account** (the account that owns the Pages project).
5. Create the token and **copy the value** (you won’t see it again).
6. In your deployment platform (Replit, etc.), set **Environment variable**:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: the token you just copied (no spaces, full string).
7. Redeploy.

If your platform injected a “User API Token” or preset token automatically, replace it with this Custom token in the env vars so the deploy step uses it. If the log still says "User API Token", the deploy is using another token (e.g. Replit’s): set CLOUDFLARE_API_TOKEN in **Tools → Secrets** and remove any other Cloudflare secret. Test locally: after `npm run build`, run `CLOUDFLARE_API_TOKEN=your_token npx wrangler pages deploy dist/public`.

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

| Setting              | Value                                      |
|----------------------|--------------------------------------------|
| Build command        | `npm run build` or `npm run dev`           |
| **Deploy command**   | **`npx wrangler pages deploy dist/public`** |
| Build output dir     | `dist/public`                              |
| Root directory       | (leave default)                            |
