# HalalIQ Deployment Checklist

Use this checklist when moving the current MVP from local development to Supabase and the hosted frontend.

## 1. Current Project

- Supabase project ref: `bwelgjbnzhlxwymakbtp`
- Main compliance Edge Function: `analyze-food`
- Optional image extraction Edge Function: `extract-ingredients-from-image`
- Frontend API URL: `https://bwelgjbnzhlxwymakbtp.supabase.co/functions/v1/analyze-food`
- Optional image API URL: `https://bwelgjbnzhlxwymakbtp.supabase.co/functions/v1/extract-ingredients-from-image`

## 2. Deploy Now Without AI Credits

Deploy `analyze-food` now because it does not require an OpenAI, Claude, or Gemini key.

The frontend can still demonstrate image input with the `Use demo OCR` button, so the project remains presentable before paid AI is connected.

## 3. Supabase UI Deploy Path

If you are using the Supabase dashboard instead of the CLI:

1. Open Supabase Dashboard.
2. Go to `Edge Functions`.
3. Open or create `analyze-food`.
4. Copy the full contents of `backend/supabase/functions/analyze-food/index.ts`.
5. Paste it into the function editor.
6. Click `Deploy updates`.
7. Test the frontend manual scan.

When you later add an AI API key:

1. Create `extract-ingredients-from-image`.
2. Copy the full contents of `backend/supabase/functions/extract-ingredients-from-image/index.ts`.
3. Add the required secret `OPENAI_API_KEY`.
4. Optionally add `OPENAI_VISION_MODEL`.
5. Click `Deploy updates`.
6. Test photo extraction with a real label image.

## 4. Supabase CLI Deploy Path

The Supabase CLI is not currently installed on this machine.

After installing it, run these from `backend/supabase`:

```powershell
supabase login
supabase functions deploy analyze-food
supabase functions deploy extract-ingredients-from-image
```

Only deploy `extract-ingredients-from-image` after setting AI secrets:

```powershell
supabase secrets set OPENAI_API_KEY="your-openai-api-key"
supabase secrets set OPENAI_VISION_MODEL="gpt-4.1-mini"
```

## 5. Required Supabase Secrets For `analyze-food`

Make sure these are set in Supabase Edge Function secrets:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEO4J_URI
NEO4J_USERNAME
NEO4J_PASSWORD
```

Do not put service role keys, Neo4j passwords, or API keys in GitHub.

## 6. Frontend Environment

Set these values in the frontend hosting platform:

```text
VITE_HALALIQ_ANALYZE_URL=https://bwelgjbnzhlxwymakbtp.supabase.co/functions/v1/analyze-food
VITE_HALALIQ_EXTRACT_URL=https://bwelgjbnzhlxwymakbtp.supabase.co/functions/v1/extract-ingredients-from-image
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

The anon key is public-safe for frontend use, but `.env.local` should still stay uncommitted.

## 7. Neo4j Domain Seeds

Run this script in Neo4j Browser or Neo4j Desktop when you are ready to add domain data:

```text
backend/neo4j/seeds/domain-expansion.cypher
```

This adds:

- Cosmetics & Personal Care risk data
- Export Compliance risk data
- Domain nodes for future filtering
- Document requirements and market nodes

The script uses `MERGE`, so it is safe to rerun during development.

## 8. Manual Verification

After deploying `analyze-food`, test these from the frontend:

- Food sample: `Chocolate Wafer Biscuit`
- Cosmetics sample: `Brightening Face Cream`
- Export Compliance sample: `UAE Export Snack Pack`
- Pharmaceuticals sample: `Softgel Supplement`

Expected behavior before Neo4j domain seeds:

- Food uses existing graph data.
- Non-food domains return `Needs Review` fallback warnings instead of false `Low Risk`.

Expected behavior after Neo4j domain seeds:

- Cosmetics and Export Compliance return domain-specific evidence requirements when matching seeded ingredients exist.

## 9. Final Smoke Test

Run this locally before pushing or deploying frontend updates:

```powershell
cd frontend
npm.cmd run build
```

Then open:

```text
http://127.0.0.1:8081/assistant
```

Use `Use demo OCR`, confirm editable ingredients update, then run a manual compliance scan.
