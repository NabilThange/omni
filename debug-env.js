console.log('----------------------------------------');
console.log('🔍 VERIFYING ENVIRONMENT VARIABLES');
console.log('----------------------------------------');
console.log('INGEST URL:', process.env.NEXT_PUBLIC_N8N_INGEST_WEBHOOK);
console.log('CLIPS URL:', process.env.NEXT_PUBLIC_N8N_CLIPS_WEBHOOK);
console.log('----------------------------------------');

if (process.env.NEXT_PUBLIC_N8N_INGEST_WEBHOOK && process.env.NEXT_PUBLIC_N8N_INGEST_WEBHOOK.includes('|')) {
  console.error('❌ CRITICAL ERROR: INGEST URL contains a pipe character (|). Please fix your Vercel environment variable.');
} else {
  console.log('✅ INGEST URL format looks correct.');
}

if (process.env.NEXT_PUBLIC_N8N_CLIPS_WEBHOOK && process.env.NEXT_PUBLIC_N8N_CLIPS_WEBHOOK.includes('|')) {
  console.error('❌ CRITICAL ERROR: CLIPS URL contains a pipe character (|). Please fix your Vercel environment variable.');
} else {
  console.log('✅ CLIPS URL format looks correct.');
}
