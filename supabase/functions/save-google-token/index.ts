// ARQUIVO FINAL E CORRIGIDO: supabase/functions/save-google-token/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record: user } = await req.json();

    // Remove a verificação específica do Google para funcionar com qualquer provedor
    if (!user || !user.raw_user_meta_data?.provider) {
      // Retorna sucesso, mas com uma mensagem de que ignorou, pois não é um login de provedor
      return new Response(JSON.stringify({ message: "Não é um evento de login OAuth, ignorando." }), { status: 200 });
    }
    
    const credentials = user.raw_user_meta_data;
    const userId = user.id;
    // Pega o nome do provedor dinamicamente ('google' ou 'azure')
    const provider = credentials.provider; 

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users').select('company_id').eq('id', userId).single();
    if (profileError) throw profileError;

    const integrationData = {
      user_id: userId,
      company_id: profile.company_id,
      provider: provider, // Usa a variável 'provider'
      credentials: {
        access_token: credentials.provider_token,
        refresh_token: credentials.provider_refresh_token,
        expires_at: credentials.expires_at, // O Supabase fornece isso para o Google
      },
      is_enabled: true,
      last_sync_at: new Date().toISOString(),
    };
    
    const { error: upsertError } = await supabaseAdmin
      .from('integrations')
      .upsert(integrationData, { onConflict: 'company_id, provider' }); 

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ message: `Token do ${provider} salvo com sucesso!` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});