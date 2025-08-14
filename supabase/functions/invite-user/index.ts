// ARQUIVO DE DEPURAÇÃO MÁXIMA: supabase/functions/invite-user/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Loga a chamada imediatamente
  console.log('--- Nova requisição recebida em invite-user ---');
  console.log(`Método: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('ERRO: Cabeçalho de autorização ausente.');
      throw new Error('Autorização ausente.');
    }
    const token = authHeader.replace('Bearer ', '');
    console.log('Token recebido (primeiros 20 chars):', token.substring(0, 20));

    const body = await req.json();
    console.log('Corpo da requisição recebido:', body);
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user: inviter }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    if (!inviter) throw new Error("Usuário que está convidando não foi autenticado.");
    console.log(`Usuário autenticado: ${inviter.email}`);

    const { data: inviterProfile } = await supabaseAdmin.from('users').select('company_id').eq('id', inviter.id).single();
    if (!inviterProfile) throw new Error("Perfil de quem está convidando não encontrado.");
    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      body.email,
      { data: { full_name: body.fullName, role_id: body.roleId, department_id: body.departmentId, company_id: inviterProfile.company_id } }
    );
    if (inviteError) throw new Error(`Erro ao convidar: ${inviteError.message}`);

    console.log('SUCESSO: Convite enviado.');
    return new Response(JSON.stringify(inviteData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na função';
    console.error(`ERRO FINAL NA FUNÇÃO: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
    });
  }
});