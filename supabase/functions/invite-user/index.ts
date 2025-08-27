// ARQUIVO COMPLETO E ATUALIZADO: supabase/functions/sync-google-drive/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { google } from 'https://esm.sh/googleapis@126.0.1';
import type { Credentials } from "https://esm.sh/google-auth-library@9.1.0/build/src/auth/credentials.d.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')!.replace('Bearer ', ''));
    if (!user) throw new Error("Usuário não autenticado.");
    
    const { data: profile } = await supabaseAdmin.from('users').select('company_id').eq('id', user.id).single();
    if (!profile) throw new Error("Perfil do usuário não encontrado.");
    
    const { data: integration } = await supabaseAdmin.from('integrations').select('credentials').eq('company_id', profile.company_id).eq('provider', 'GOOGLE_DRIVE').single();
    if (!integration) throw new Error("Integração com Google Drive não encontrada.");
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(integration.credentials as Credentials);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const res = await drive.files.list({
      q: "mimeType != 'application/vnd.google-apps.folder'",
      fields: 'files(id, name, mimeType, size, createdTime, parents)',
      pageSize: 200,
    });
    const driveFiles = res.data.files;
    if (!driveFiles || driveFiles.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum arquivo encontrado.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    
    const { data: departments } = await supabaseAdmin.from('departments').select('id, name').eq('company_id', profile.company_id);
    const departmentMap = new Map(departments?.map(d => [d.name.toLowerCase(), d.id]));

    const documentsToUpsert = [];
    for (const file of driveFiles) {
      let departmentId = null;
      if (file.parents && file.parents.length > 0) {
        const parentFolder = await drive.files.get({ fileId: file.parents[0], fields: 'name' });
        const departmentName = parentFolder.data.name?.toLowerCase();
        if (departmentName && departmentMap.has(departmentName)) {
          departmentId = departmentMap.get(departmentName);
        }
      }
      documentsToUpsert.push({
        name: file.name, file_path: file.id, file_type: file.mimeType,
        file_size: parseInt(file.size || '0'), created_at: file.createdTime,
        company_id: profile.company_id, department_id: departmentId,
        uploaded_by: user.id, storage_provider: 'GOOGLE_DRIVE',
      });
    }
    
    await supabaseAdmin.from('documents').upsert(documentsToUpsert, { onConflict: 'file_path' });
    
    return new Response(JSON.stringify({ message: `${documentsToUpsert.length} arquivos sincronizados.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});