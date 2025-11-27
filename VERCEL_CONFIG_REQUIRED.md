# 🚨 CRITICAL: Vercel Dashboard Configuration Required

The code is fixed, but Vercel Environment Variables might override it.

## 🛑 Stop and Do This First

1. Log in to **Vercel Dashboard**.
2. Go to **Settings** → **Environment Variables**.
3. **UPDATE** `NEXT_PUBLIC_INGEST_CONTENT_WEBHOOK` to:
   ```
   /api/ingest-content
   ```
   *(It is likely currently set to `https://vyx-n8n.onrender.com...` - CHANGE IT!)*

4. **UPDATE** `NEXT_PUBLIC_CLIP_YOUTUBE_WEBHOOK` to:
   ```
   /api/clip-youtube
   ```

5. **ADD** these new variables (if missing):
   - `N8N_INGEST_WEBHOOK_URL` = `https://vyx-n8n.onrender.com/webhook/ingest-content`
   - `N8N_CLIP_WEBHOOK_URL` = `https://vyx-n8n.onrender.com/webhook/clip-youtube`

6. **Redeploy** your application (or verify the next deployment picks up these changes).

---

## ✅ Code Verification

The codebase is already updated to use these values:
- `lib/n8n-client.ts` defaults to `/api/ingest-content`.
- API routes (`app/api/...`) proxy requests to the `N8N_...` variables.

## 🧪 Test After Redeploy

1. Open `https://vyx.vercel.app/upload`.
2. Open DevTools Network Tab.
3. Submit form.
4. Request URL **MUST** be `https://vyx.vercel.app/api/ingest-content`.

If it still shows `onrender.com`, your Vercel Environment Variables are still wrong!
