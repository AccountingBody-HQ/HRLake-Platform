import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createHash } from "crypto"
import OpenAI from "openai"

export const maxDuration = 60

const MISSING_COUNTRIES = [
  { code: "BR", name: "Brazil" },
  { code: "ET", name: "Ethiopia" },
]

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-admin-seed-key")
  const secret = process.env.ADMIN_SECRET
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const a = createHash("sha256").update(authHeader).digest()
  const b = createHash("sha256").update(secret).digest()
  const match = a.length === b.length && a.every((v, i) => v === b[i])
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const results: any[] = []

  for (const country of MISSING_COUNTRIES) {
    const text = `${country.name} payroll and employment information. Country code: ${country.code}. Visit /countries/${country.code.toLowerCase()}/ for full tax brackets, social security rates, employer costs, employment law, and payroll calculator.`

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })

    const embedding = embeddingResponse.data[0].embedding

    const { error } = await supabase.schema("hrlake").from("embeddings").insert({
      country_code: country.code,
      content_type: "country_summary",
      title: `${country.name} Payroll Guide`,
      content_chunk: text,
      embedding,
      token_count: text.split(" ").length,
    })

    results.push({
      country: country.code,
      status: error ? `failed: ${error.message}` : "inserted",
    })
  }

  return NextResponse.json({ results })
}
