# Supabase Edge Functions - Local Development & Testing

This guide explains how to run and test Supabase Edge Functions locally using Deno and the Supabase CLI.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Running Tests](#running-tests)
4. [Running Functions Locally](#running-functions-locally)
5. [Debugging](#debugging)
6. [Production Deployment](#production-deployment)

---

## Prerequisites

### System Requirements

- **Deno** (v1.40+): Download from [deno.com](https://deno.land)
- **Supabase CLI**: Install via npm or binary
- **Node.js & npm** (for frontend and CLI)

### Install Deno

```powershell
# On Windows, using scoop (recommended)
scoop install deno

# Or download directly from https://deno.land
```

Verify installation:

```powershell
deno --version
```

### Install Supabase CLI

```bash
npm install -g supabase
```

Verify installation:

```bash
supabase --version
```

---

## Local Setup

### 1. Initialize Supabase Locally

```bash
cd phish-guard-main
supabase init
```

This creates a `supabase/` directory with default configuration.

### 2. Start Local Supabase Stack

```bash
supabase start
```

This starts:
- **PostgreSQL** database on `localhost:5432`
- **Supabase Studio** (web UI) on `localhost:54323`
- **Edge Functions emulator** on `localhost:54321`

Output will show:
```
Started supabase local development server.

API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:5432/postgres
Studio: http://localhost:54323
...
```

Save the `anon key` and `service_role key` from the output—you'll need them for testing.

### 3. Set Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase local config
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<paste anon key from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key>

# Allowed origin for testing local functions (Comma separated for multiple)
ALLOWED_ORIGIN=http://localhost:8080

# AI Gateway (for testing functions)
LOVABLE_API_KEY=<your lovable API key or mock value>
```

---

## Running Tests

### 1. Run Parser & Schema Tests (Deno)

Tests are located in `supabase/functions/__tests__/`.

#### Test Parser & Schemas

```bash
cd supabase/functions/__tests__
deno run --allow-all schemas.test.ts
```

**Expected Output:**
```
=== PARSER & SCHEMA TESTS ===

✓ PASS: Valid email extraction with all fields
✓ PASS: Valid email with minimal fields
✓ PASS: Valid URL array
✓ PASS: Empty URL array
✓ PASS: Valid AI analysis
✓ PASS: JSON wrapped in ```json fences
✓ PASS: JSON wrapped in plain ``` fences
✓ PASS: URL array with code fences
✓ PASS: Email with all optional fields as null
✗ FAIL: Completely malformed JSON (correctly failed)
...

=== RESULTS ===
Passed: 18
Failed: 0
Total: 18
```

#### Test Edge Function Harnesses

```bash
deno run --allow-all edge-functions.test.ts
```

**Expected Output:**
```
=== EXTRACT-EMAIL-FROM-PDF TESTS ===

✓ PASS: Valid Email Extraction with Hidden Links
  → Realistic phishing email with spoofing and hidden links
✓ PASS: Legitimate Email Response
  → Legitimate business email
✓ PASS: Response with Markdown Code Fences
  → AI response wrapped in markdown code fence
✗ FAIL: Malformed JSON (Should Fail Gracefully) (correctly rejected)
...

=== EXTRACT-URLS-FROM-IMAGE TESTS ===

✓ PASS: Valid URL Array
...

=== SUMMARY ===
Email Tests: 7/8 passed
URL Tests: 6/6 passed

Total: 13 passed, 0 failed
```

### 2. Run Frontend Tests

```bash
npm run test
```

Runs Vitest tests defined in `src/test/`.

---

## Running Functions Locally

### 1. Invoke extract-email-from-pdf Locally

Use `curl` or Postman to invoke the function against your local Supabase:

```bash
curl -X POST http://localhost:54321/functions/v1/extract-email-from-pdf \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "pdf_base64": "data:application/pdf;base64,..."
  }'
```

### 2. View Function Logs

```bash
supabase functions list
supabase functions logs extract-email-from-pdf
```

### 3. Test Using Supabase Studio

1. Navigate to `http://localhost:54323` (Supabase Studio)
2. Go to **Functions** → **extract-email-from-pdf**
3. Click **Invoke** and provide test payload:

```json
{
  "pdf_base64": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

---

## Debugging

### Enable Debug Logging

Set environment variables before running tests:

```powershell
$env:DEBUG = "supabase:*"
deno run --allow-all --allow-env schemas.test.ts
```

### View Function Errors

```bash
supabase functions logs <function-name>
```

### Test Against Mock AI Gateway

If you want to test functions without hitting the real AI gateway, set `LOVABLE_API_KEY` to a test value and the functions will fail gracefully.

Example mock response validation:

```typescript
// In edge function during dev
if (!LOVABLE_API_KEY || LOVABLE_API_KEY === "mock") {
  console.log("Using mock AI response");
  const mockResponse = {
    choices: [{
      message: {
        content: '{"urls": ["https://example.com"]}'
      }
    }]
  };
  // Process mock response instead of calling AI gateway
}
```

---

## Production Deployment

### Deploy Functions to Supabase Cloud

```bash
# Link to your Supabase project
supabase link --project-ref <YOUR_PROJECT_ID>

# Set production environment variables
supabase secrets set LOVABLE_API_KEY=<your-api-key>

# Deploy functions
supabase functions deploy extract-email-from-pdf
supabase functions deploy extract-urls-from-image
supabase functions deploy detect-phishing

# Verify deployment
supabase functions list
```

### Update CORS for Production

Update `CORS` headers in each function for your production domain:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### Database Migrations

Apply migrations to Supabase:

```bash
supabase migration list
supabase db push
```

---

## File Structure

```
supabase/
├── functions/
│   ├── _schemas.ts                      # Shared zod schemas & parser
│   ├── detect-phishing/
│   │   └── index.ts                     # Main phishing detection function
│   ├── extract-email-from-pdf/
│   │   └── index.ts                     # PDF email extraction function
│   ├── extract-urls-from-image/
│   │   └── index.ts                     # Image OCR & URL extraction
│   └── __tests__/
│       ├── schemas.test.ts              # Parser unit tests
│       └── edge-functions.test.ts       # Function harnesses
├── migrations/
│   └── *.sql                            # Database migrations
└── config.toml                          # Local Supabase config
```

---

## Troubleshooting

### Issue: `supabase start` fails

```
Error: Docker not running
```

**Solution:** Start Docker Desktop or install Supabase locally without Docker using the binary.

### Issue: Tests fail with "permission denied" (Deno)

```
error: Uncaught (in promise) PermissionDenied: read access to "<file>"
```

**Solution:** Add `--allow-all` flag or specific permissions:

```bash
deno run --allow-read --allow-env --allow-net schemas.test.ts
```

### Issue: Functions timeout

- Check `LOVABLE_API_KEY` is set
- Verify network connectivity to AI gateway
- Increase timeout in function configuration

### Issue: CORS errors in browser

- Verify `Access-Control-Allow-Origin` is set correctly in function headers
- Check your frontend URL matches the allowed origin

---

## Quick Commands Reference

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Run all tests
deno run --allow-all supabase/functions/__tests__/schemas.test.ts
deno run --allow-all supabase/functions/__tests__/edge-functions.test.ts

# Deploy to production
supabase functions deploy extract-email-from-pdf

# View logs
supabase functions logs extract-email-from-pdf

# Reset local database
supabase db reset
```

---

## Next Steps

1. **Set up CI/CD**: Add GitHub Actions to run tests on every commit
2. **Add monitoring**: Integrate Sentry or similar for error tracking
3. **Performance tuning**: Profile functions and optimize slow operations
4. **Security hardening**: Add rate limiting, input validation, and authentication checks

---

**Need help?**

- Supabase Docs: https://supabase.com/docs
- Deno Docs: https://docs.deno.com
- Issue Tracker: [GitHub Issues](link-to-your-repo)
