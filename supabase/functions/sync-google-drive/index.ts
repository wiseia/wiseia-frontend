// ARQUIVO FINAL E CORRIGIDO: supabase/functions/sync-google-drive/index.ts

import { createClient, User } from "npm:@supabase/supabase-js@2.38.4";
import { google } from "npm:googleapis@126.0.1";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

async function getUser(req: Request): Promise<{ user: User | null }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { user: null };

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Auth error:", error);
    return { user: null };
  }
  return { user };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { user } = await getUser(req);
    if (!user) throw new Error("Usuário não autenticado");

    const { data: profile } = await supabaseAdmin
      .from("users").select("company_id").eq("id", user.id).single();
    if (!profile) throw new Error("Perfil de usuário não encontrado.");

    const { data: integration } = await supabaseAdmin
      .from("integrations").select("credentials").eq("company_id", profile.company_id).eq("provider", "google").single();
    if (!integration) throw new Error("Integração do Google não encontrada.");
      
    const credentials = integration.credentials as { access_token: string, refresh_token: string };
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(credentials);

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    console.log("Iniciando busca de arquivos no Google Drive...");
    const listRes = await drive.files.list({
      pageSize: 100,
      fields: "files(id, name, mimeType, webViewLink, parents)",
      q: "'root' in parents and trashed=false",
    });

    const driveFiles = listRes.data.files || [];
    console.log(`Google API retornou ${driveFiles.length} itens:`, driveFiles);

    if (driveFiles.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum item encontrado na raiz do Drive." }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const documentsToUpsert = driveFiles.map(file => ({
      name: file.name,
      file_path: file.webViewLink,
      file_id: file.id,
      file_type: file.mimeType,
      company_id: profile.company_id,
      uploaded_by: user.id,
      storage_provider: 'GOOGLE_DRIVE',
    }));
    console.log("Itens que serão salvos:", documentsToUpsert);

    const { error: insertError } = await supabaseAdmin
      .from("documents").upsert(documentsToUpsert, { onConflict: "file_id" });
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: `${driveFiles.length} itens sincronizados.` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ error: "Sync failed", details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});