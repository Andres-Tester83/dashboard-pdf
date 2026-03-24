import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
});

async function testDrive() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('Intentando verificar permisos en la carpeta:', process.env.GDRIVE_FOLDER_SIN_PROCESAR);
    
    // Primero intentamos leer la carpeta
    await drive.files.get({ fileId: process.env.GDRIVE_FOLDER_SIN_PROCESAR! });
    console.log('✅ Lectura de carpeta exitosa');

    // Luego intentamos subir un archivo dummy
    const stream = Readable.from(Buffer.from('test file'));
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: 'test_upload.txt',
        parents: [process.env.GDRIVE_FOLDER_SIN_PROCESAR!],
      },
      media: {
        mimeType: 'text/plain',
        body: stream,
      },
    });

    console.log('✅ Subida exitosa con ID:', uploadResponse.data.id);
    
    // Y lo borramos
    await drive.files.delete({ fileId: uploadResponse.data.id! });
    console.log('✅ Limpieza exitosa');

  } catch (error: any) {
    console.error('❌ ERROR DETALLADO:');
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testDrive();
