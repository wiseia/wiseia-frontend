// Arquivo: supabase/functions/secret-debugger/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req) => {
  // Tenta ler o segredo que acabamos de definir
  const secretMessage = Deno.env.get("TEST_MESSAGE");

  const data = {
    message: secretMessage || "ERRO: O segredo TEST_MESSAGE não foi encontrado."
  };

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});