import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createServerClient();
  const { data, error } = await supabase.from("rankings").select("id").limit(1);

  return NextResponse.json({
    urlSet: !!url,
    urlPrefix: url?.substring(0, 35),
    keySet: !!key,
    keyPrefix: key?.substring(0, 20),
    supabaseError: error ? { message: error.message, code: error.code, hint: error.hint } : null,
    dataOk: !!data,
  });
}
