/**
 * Testa a conexão com o Supabase e aplica o schema da tabela rankings.
 * Uso: node scripts/setup-db.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lê .env.local manualmente (sem dotenv)
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "")];
    })
);

const url = env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!url || !serviceKey) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados em .env.local");
  process.exit(1);
}

console.log(`🔗  Conectando em ${url} ...`);
const supabase = createClient(url, serviceKey);

// 1. Testa conexão tentando listar a tabela rankings
const { error: testError } = await supabase.from("rankings").select("id").limit(1);

if (testError) {
  const isTableMissing =
    testError.code === "42P01" ||
    testError.message?.includes("schema cache") ||
    testError.message?.includes("does not exist");

  if (isTableMissing) {
    console.log("⚠️   Tabela 'rankings' não existe ainda — aplicando schema...");
    await applySchema();
  } else {
    console.error("❌  Erro ao conectar:", testError.message, `(code: ${testError.code})`);
    process.exit(1);
  }
} else {
  console.log("✅  Conexão OK — tabela 'rankings' já existe.");
  await verifyTable();
}

async function applySchema() {
  // Supabase JS client não executa DDL diretamente.
  // Usamos a Management API com a service role para executar SQL via RPC.
  const sqlPath = resolve(__dirname, "../supabase/schema.sql");
  const sql = readFileSync(sqlPath, "utf8");

  // Tenta via rpc exec_sql (disponível se a função existir)
  const { error } = await supabase.rpc("exec_sql", { query: sql });
  if (error) {
    console.log("");
    console.log("ℹ️   Não foi possível aplicar o schema automaticamente via RPC.");
    console.log("    Copie e cole o conteúdo de supabase/schema.sql no SQL Editor do painel:");
    console.log(`    https://supabase.com/dashboard/project/glmomlxsnspzvaskviwc/sql/new`);
    console.log("");
    console.log("    Após executar o SQL no painel, rode novamente: node scripts/setup-db.mjs");
    process.exit(0);
  }

  console.log("✅  Schema aplicado com sucesso!");
  await verifyTable();
}

async function verifyTable() {
  // Verifica a estrutura esperada inserindo e deletando um registro de teste
  const testSessionId = "00000000-0000-0000-0000-000000000001";

  // Limpa eventual registro de teste anterior
  await supabase.from("rankings").delete().eq("session_id", testSessionId);

  const { error: insertError } = await supabase.from("rankings").insert({
    nickname: "test_setup",
    score: 0,
    correct_count: 0,
    session_id: testSessionId,
    ip_hash: "test",
  });

  if (insertError) {
    console.error("❌  Falha ao inserir registro de teste:", insertError.message);
    console.log("    Verifique se o schema foi aplicado corretamente (RLS e constraints).");
    process.exit(1);
  }

  await supabase.from("rankings").delete().eq("session_id", testSessionId);
  console.log("✅  INSERT/DELETE de teste OK — banco de dados pronto!");

  // Exibe resumo
  const { count } = await supabase
    .from("rankings")
    .select("id", { count: "exact", head: true });
  console.log(`📊  Registros atuais no ranking: ${count ?? 0}`);
}
