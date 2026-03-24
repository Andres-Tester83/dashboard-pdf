import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Solo se aceptan archivos PDF' }, { status: 400 });
    }

    // Reconstruimos el FormData para cambiar el nombre de 'file' a 'data', 
    // ya que n8n por defecto busca los archivos binarios en la propiedad 'data'.
    const n8nFormData = new FormData();
    n8nFormData.append('data', file);
    n8nFormData.append('cuenta', formData.get('cuenta') || 'Personal');

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      console.log(`Enviando POST a webhook n8n: ${webhookUrl}`);
      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        body: n8nFormData,
      });
      
      if (!webhookRes.ok) {
        const errText = await webhookRes.text().catch(() => '');
        console.error(`n8n webhook error ${webhookRes.status}:`, errText);
        return NextResponse.json(
          { error: `El workflow n8n respondió con error ${webhookRes.status}. Verifica que el workflow de n8n esté ACTIVO.` },
          { status: 502 }
        );
      }
    } else {
       console.error("No N8N_WEBHOOK_URL defined!");
    }

    return NextResponse.json({
      success: true,
      message: `✅ PDF enviado a n8n. ${file.name} será procesado en breve.`,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Error de conexión interno: ${error.message}` },
      { status: 500 }
    );
  }
}
