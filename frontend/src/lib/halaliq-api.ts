export type OverallStatus = "Not Ready" | "Needs Review" | "Low Risk";

export type ComplianceDomain = "food" | "cosmetics" | "export_compliance" | "pharmaceuticals";

export type ComplianceEntry = {
  ingredient: string;
  risk: string;
  reasoning: string;
  required_documents: string[];
  affected_markets: string[];
};

export type ComplianceSummary = {
  total_ingredients: number;
  blockers_count: number;
  warnings_count: number;
  human_readable: string;
};

export type ReportHistoryItem = {
  id: string;
  created_at: string;
  reports?: Array<{
    result?: ComplianceReport;
    created_at?: string;
  }>;
};

export type ComplianceReport = {
  product_name: string;
  domain?: ComplianceDomain;
  market?: string;
  overall_status: OverallStatus;
  summary: ComplianceSummary;
  blockers: ComplianceEntry[];
  warnings: ComplianceEntry[];
  safe: ComplianceEntry[];
  history?: ReportHistoryItem[];
};

export type AnalyzeProductInput = {
  product_name: string;
  ingredients: string[];
  market: string;
  domain?: ComplianceDomain;
};

export type ExtractIngredientsInput = {
  image_base64: string;
  mime_type: string;
  product_name?: string;
  market?: string;
  domain?: ComplianceDomain;
};

export type ExtractIngredientsResult = {
  raw_text: string;
  ingredients: string[];
  confidence: number;
  warnings: string[];
  needs_review: boolean;
  visual_warning?: string | null;
};

export type BarcodeLookupResult = {
  code: string;
  product_name: string;
  ingredients_text: string;
  brand?: string;
  source_label: string;
};

const DEFAULT_ANALYZE_URL = "https://bwelgjbnzhlxwymakbtp.supabase.co/functions/v1/analyze-food";

const DEFAULT_EXTRACT_URL =
  "https://bwelgjbnzhlxwymakbtp.supabase.co/functions/v1/extract-ingredients-from-image";

function getAnalyzeUrl(): string {
  return import.meta.env.VITE_HALALIQ_ANALYZE_URL || DEFAULT_ANALYZE_URL;
}

function getExtractUrl(): string {
  return import.meta.env.VITE_HALALIQ_EXTRACT_URL || DEFAULT_EXTRACT_URL;
}

function getOptionalAnonKey(): string | undefined {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || undefined;
}

function buildHeaders(): HeadersInit {
  const anonKey = getOptionalAnonKey();

  if (!anonKey) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;

    if (typeof error === "string" && error.trim().length > 0) {
      return error;
    }
  }

  return fallback;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function analyzeProduct(input: AnalyzeProductInput): Promise<ComplianceReport> {
  const response = await fetch(getAnalyzeUrl(), {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(input),
  });

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, "The compliance scan failed."));
  }

  return payload as ComplianceReport;
}

export async function extractIngredientsFromImage(
  input: ExtractIngredientsInput,
): Promise<ExtractIngredientsResult> {
  try {
    const response = await fetch(getExtractUrl(), {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(input),
    });
    const payload = await readJsonResponse(response);

    if (response.ok) return payload as ExtractIngredientsResult;
  } catch (_error) {
    // ponytail: local OCR keeps the demo usable when the optional hosted extractor is unavailable.
  }

  const { recognize } = await import("tesseract.js");
  const imageUrl = `data:${input.mime_type};base64,${input.image_base64}`;
  const result = await recognize(imageUrl, "eng");
  const rawText = result.data.text.trim();
  const ingredientText = rawText.replace(/[\s\S]*?ingredients?\s*[:\-]?/i, "");
  const ingredients = ingredientText
    .split(/[,;\n]/)
    .map((value) => value.replace(/^[\s•*-]+|[\s.]+$/g, "").trim())
    .filter((value) => value.length > 1 && value.length < 80);
  const confidence = Math.max(0, Math.min(1, result.data.confidence / 100));

  return {
    raw_text: rawText,
    ingredients: Array.from(new Set(ingredients)),
    confidence,
    warnings: rawText
      ? ["Please review the extracted text before scanning."]
      : ["No readable label text was found."],
    needs_review: true,
    visual_warning: null,
  };
}

export async function lookupBarcodeProduct(
  code: string,
  domain: ComplianceDomain = "food",
): Promise<BarcodeLookupResult | null> {
  const normalizedCode = code.trim();

  if (!/^\d{8,14}$/.test(normalizedCode)) {
    return null;
  }

  const sourceConfigs =
    domain === "cosmetics"
      ? [
          {
            label: "Open Beauty Facts lookup",
            url: `https://world.openbeautyfacts.org/api/v2/product/${normalizedCode}.json?fields=code,product_name,ingredients_text,ingredients_text_en,brands,status`,
          },
          {
            label: "Open Food Facts lookup",
            url: `https://world.openfoodfacts.org/api/v2/product/${normalizedCode}.json?fields=code,product_name,ingredients_text,ingredients_text_en,brands,status`,
          },
        ]
      : [
          {
            label: "Open Food Facts lookup",
            url: `https://world.openfoodfacts.org/api/v2/product/${normalizedCode}.json?fields=code,product_name,ingredients_text,ingredients_text_en,brands,status`,
          },
          {
            label: "Open Beauty Facts lookup",
            url: `https://world.openbeautyfacts.org/api/v2/product/${normalizedCode}.json?fields=code,product_name,ingredients_text,ingredients_text_en,brands,status`,
          },
        ];

  for (const source of sourceConfigs) {
    const response = await fetch(source.url);
    const payload = await readJsonResponse(response);

    if (!response.ok || !isPlainObject(payload)) {
      continue;
    }

    const product = isPlainObject(payload.product) ? payload.product : null;

    if (!product) {
      continue;
    }

    const productName = typeof product.product_name === "string" ? product.product_name.trim() : "";
    const ingredientsTextCandidates = [
      typeof product.ingredients_text_en === "string" ? product.ingredients_text_en.trim() : "",
      typeof product.ingredients_text === "string" ? product.ingredients_text.trim() : "",
    ].filter((value) => value.length > 0);

    const ingredientsText = ingredientsTextCandidates[0] ?? "";

    if (!productName || !ingredientsText) {
      continue;
    }

    return {
      code: normalizedCode,
      product_name: productName,
      ingredients_text: ingredientsText,
      brand: typeof product.brands === "string" ? product.brands.trim() || undefined : undefined,
      source_label: source.label,
    };
  }

  return null;
}
