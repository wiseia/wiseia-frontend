// ARQUIVO COMPLETO E ATUALIZADO: supabase/functions/upload-to-drive/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { google } from 'https://esm.sh/googleapis@126.0.1';
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import type { Credentials } from "https://esm.sh/google-auth-library@9.1.0/build/src/auth/credentials.d.ts";

const getDriveClient = (credentials: Credentials) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(credentials);
  return google.drive({ version: 'v3', auth: oauth2Client });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')!.replace('Bearer ', ''));
    if (!user) throw new Error("Usuário não autenticado.");
    
    const { data: profile } = await supabaseAdmin.from('users').select('company_id, department_id').eq('id', user.id).single();
    if (!profile) throw new Error("Perfil do usuário não encontrado.");

    const { data: integration } = await supabaseAdmin.from('integrations').select('credentials').eq('company_id', profile.company_id).eq('provider', 'GOOGLE_DRIVE').single();
    if (!integration) throw new Error("Integração com Google Drive não encontrada.");
    
    const { fileName, fileType, fileDataUrl } = await req.json();
    const fileData = decode(fileDataUrl.split(',')[1]);
    
    const drive = getDriveClient(integration.credentials as Credentials);
    
    const { data: departmentData } = await supabaseAdmin.from('departments').select('name').eq('id', profile.department_id).single();
    const departmentName = departmentData?.name || 'Documentos Gerais';

    let folderId: string;
    const folderSearch = await drive.files.list({ q: `mimeType='application/vnd.google-apps.folder' and name='${departmentName}' and trashed=false`, fields: 'files(id)' });

    if (folderSearch.data.files && folderSearch.data.files.length > 0) {
      folderId = folderSearch.data.files[0].id!;
    } else {
      const folderMetadata = { name: departmentName, mimeType: 'application/vnd.google-apps.folder' };
      const createdFolder = await drive.files.create({ requestBody: folderMetadata, fields: 'id' });
      folderId = createdFolder.data.id!;
    }
    
    const response = await drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType: fileType, body: new Blob([fileData]) },
      fields: 'id, name, mimeType',
    });
    
    return new Response(JSON.stringify(response.data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: errorMessage }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});