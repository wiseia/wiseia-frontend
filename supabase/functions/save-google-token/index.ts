// ARQUIVO ATUALIZADO: supabase/functions/save-google-token/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface TokenPayload {
  provider_token: string;
  provider_refresh_token: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { provider_token, provider_refresh_token }: TokenPayload = await req.json();
    if (!provider_token || !provider_refresh_token) {
      throw new Error('Tokens de provedor ausentes na requisição.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error('Falha ao autenticar o usuário.');
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.company_id) {
      throw new Error('Perfil do usuário ou ID da empresa não encontrado.');
    }
    
    const credentials = {
      access_token: provider_token,
      refresh_token: provider_refresh_token,
    };

    const { error: upsertError } = await supabaseAdmin
      .from('integrations')
      .upsert({
        company_id: profile.company_id,
        provider: 'GOOGLE_DRIVE',
        credentials: credentials,
        is_enabled: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id, provider' }); 

    if (upsertError) {
      throw upsertError;
    }

    return new Response(JSON.stringify({ message: 'Tokens salvos com sucesso!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // CORREÇÃO AQUI: Tipando o erro corretamente para o Deno
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});