# Ekart

React/Vite storefront, Express/MongoDB API, and optional Strapi CMS. Checkout saves unpaid orders to the signed-in customer’s account; payment integration remains pending.

## Run locally

Use Node 22 (`nvm use`) and pnpm 9.15.9. Install with `pnpm install --frozen-lockfile`.

Keep your existing `packages/server/.env`, or copy `packages/server/.env.example` and fill in the values. Use a long random `JWT_SECRET`, your MongoDB connection, and S3 credentials or an AWS role. `.env` files are ignored and excluded from Docker images.

Run in separate terminals from the repository root:

```sh
pnpm --filter server dev
pnpm --filter client dev
```

Open http://localhost:5173. Vite proxies `/api` to port 5001 and `/cms` to optional Strapi on port 1337. Restart Vite after changing its proxy or environment settings. The storefront works without CMS content.

Customer authentication now uses a signed HttpOnly cookie. Existing cached user profiles do not grant access: sign in again after upgrading. Re-login as admin as well, because new admin tokens have an explicit admin role. Changing a password requires the current password and invalidates other sessions. Sign out invalidates customer sessions server-side.

Create/reset an admin using `node src/scripts/createAdmin.js` from `packages/server` after setting `ADMIN_USERNAME` and `ADMIN_PASSWORD`. This resets that admin's password if it already exists.

## Orders

Signed-in customers can use Cart → Proceed to Checkout → Place order. A successful database save shows “Order successful”, clears the cart, and records item names, quantities, prices, total, and server date/time in the customer’s MongoDB user document. My orders is available from the account menu and account page; dates display in the browser’s local timezone. Prices come from the server, and saved item details remain available after catalog changes.

Orders are placed with payment pending; no money is collected. Stock is checked at placement but unpaid orders do not reserve or deduct inventory. Inventory reservation, fulfillment, and payment reconciliation remain future work. Order creation and cart clearing share one version-checked document save to reject concurrent changes.

## Product images

All three categories support up to four JPEG, PNG, or WebP images, at most 5 MB each. The first image is the main image. Admins can add, remove, or reorder images in Add Product / Edit. S3 must remain private; reads use expiring URLs. Uploads require the logged-in admin's pending upload record, preventing reuse of arbitrary keys from another admin or product.

The backend AWS identity needs `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on `arn:aws:s3:::YOUR_BUCKET/products/*`. Bucket CORS must allow the exact frontend origin, PUT/GET/HEAD methods, and upload headers. Add production origins when deploying.

Pending uploads are tracked in MongoDB. Every five minutes, the server checks expired tracking records. Abandoned uploads become eligible after 24 hours. Failed old-image cleanup remains queued for retries. Every attempt checks current product references before deleting anything. MongoDB records are not TTL-deleted before S3 cleanup succeeds. This worker must remain running; for multiple API instances, records are claimed before processing.

Images created before upload tracking was introduced can be audited separately:

```sh
pnpm --filter server audit:images
# After reviewing the dry-run list, queue these candidates for cleanup:
pnpm --filter server audit:images --schedule
```

The audit requires an additional `s3:ListBucket` permission on the bucket ARN, restricted with `s3:prefix` to `products/mobile/*`, `products/laptop/*`, and `products/accessories/*`. It only considers unreferenced objects at least 24 hours old. The worker checks references again before deletion. The script does not purge version history: versioned S3 buckets retain noncurrent versions according to their lifecycle policy.

## Verify

```sh
pnpm test
pnpm lint
pnpm build
```

Tests use mocked database/AWS operations. The HTTP integration test starts an ephemeral localhost listener. Live AWS credentials are not required. Verify a real upload, edit, and delete with a disposable product after deployment.

## Deployment

The default frontend uses same-origin `/api` requests. Production Nginx proxies to server:5001; no browser URL is hardcoded. `VITE_API_URL` and `VITE_CMS_URL` may override origins at build time, but customer cookies require a same-site HTTPS deployment. Keep the default proxy unless you specifically need separate hosts.

For Docker development, open Docker Desktop, stop any manually started frontend/API/Strapi processes, and keep your existing local MongoDB running. From the repository root:

```sh
docker compose -f docker-compose.dev.yml up --build
```

Open http://localhost:5173 and http://localhost:1337/admin. All app images use Node 22 and pnpm 9.15.9. The development API connects to `mongodb://host.docker.internal:27017/Ekart`, matching the existing local database (the capital E matters). Server and Strapi secrets come from their local `.env` files. Strapi's existing SQLite database and uploads remain in the bind-mounted project directory; do not run native Strapi and container Strapi simultaneously. The source mounts support development edits; rebuild after dependency or Dockerfile changes. To omit CMS, start `server client` with `--no-deps`.

Useful commands:

```sh
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs -f
docker compose -f docker-compose.dev.yml down
```

To use a different MongoDB connection, set `DOCKER_MONGO_URI` in the terminal running Compose. An optional, separate MongoDB container uses a named volume and host port 27018:

```sh
DOCKER_MONGO_URI=mongodb://mongodb:27017/Ekart docker compose -f docker-compose.dev.yml --profile database up --build
```

That database starts empty; existing local records are not migrated automatically. Do not use `down --volumes` unless you intend to delete the Docker-managed data. This development setup uses Docker Desktop's `host.docker.internal` name for the existing host database.

For production, configure `packages/server/.env` with:

- `CLIENT_ORIGINS=https://your-shop.example` (comma-separated exact origins).
- A strong unique `JWT_SECRET` and AWS IAM role or credentials.
- `TRUST_PROXY_HOPS=1` only when Express is reachable through the single Nginx proxy.

Then use `docker compose -f docker-compose.prod.yml up --build -d`. The storefront binds to `127.0.0.1:8080` for an HTTPS reverse proxy. TLS, the public domain, backups, and cloud IAM configuration must be provisioned for your hosting environment. Secure customer cookies require HTTPS in production. MongoDB and Express are not published externally by this compose file. CMS content is optional; run/configure Strapi separately if required.

Use one API process for the in-memory auth limiter; replace it with a shared store when scaling replicas. Back up MongoDB and configure S3 lifecycle rules appropriate to your retention needs. Ensure old accounts have unique usernames before building the new unique index; MongoDB reports existing duplicate names rather than silently fixing them.

The server `.env` has been removed from current Git tracking while remaining on disk. Git history has not been rewritten. If real credentials were previously pushed or shared, rotate them in AWS and update your local/runtime environment. Never copy credentials into Vite variables.
