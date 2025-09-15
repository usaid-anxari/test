# TrueTestify — Backend (Milestone 1)

## Summary
Milestone 1 implements Accounts & Business Profiles:
- Auth0-based authentication (JWT)
- Business registration & public profile
- Dashboard endpoint returning businesses for the authenticated user
- DB migrations with naming conventions

## Quick start (local)
1. Create Postgres DB and set `DATABASE_URL`.
2. Configure Auth0:
   - Create an API in Auth0; set its Identifier (AUDIENCE), and configure Allowed Callback URLs for frontend.
   - Set environment variables: `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`.
3. Run migration:
   - `psql $DATABASE_URL -f migrations/001-create-milestone1.sql`
4. (optional) Seed demo data:
   - `psql $DATABASE_URL -f seeds/seed_milestone1.sql`
5. Install & start:
   - `npm install`
   - `npm run start:dev`
6. Swagger UI: `http://localhost:3000/api/docs`

## Env vars
See `.env.example`.

## Auth (Auth0)
All private endpoints require a valid Auth0 JWT in Authorization header:
`Authorization: Bearer <access_token>`

The backend validates tokens against JWKS at: `https://<AUTH0_DOMAIN>/.well-known/jwks.json`
Audience must match `AUTH0_AUDIENCE`.

## Endpoints (Milestone 1)

### POST /api/auth/register
Protected by Auth0 JWT.
- Header: `Authorization: Bearer <auth0-token>`
- Body: none
- Behavior: Upserts local user record from token info (email, name).
- Response 200:
```json
{ "user": { "id": "...", "email": "...", "name": "..." } }
