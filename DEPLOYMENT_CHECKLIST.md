# CORS Fix - Deployment Checklist ✅

## Problem Summary
Browser CORS errors when calling n8n webhooks directly from `vyx.vercel.app`:
- Preflight OPTIONS requests fail (Render doesn't return CORS headers)
- Error: `No 'Access-Control-Allow-Origin' header is present`

## Solution Implemented
Created Vercel API proxy routes to forward requests server-side (no CORS).

---

## ✅ Files Created/Modified

### New Files:
- ✅ `app/api/ingest-content/route.ts` - Proxy for content repurposing
- ✅ `app/api/clip-youtube/route.ts` - Proxy for video clipping

### Modified Files:
- ✅ `.env.local` - Updated to use proxy paths
- ✅ `app/api/clips/route.ts` - Fixed to use server-side env var
- ✅ `My workflow.json` - CORS headers added (bonus, not strictly needed with proxy)

---

## 🚀 Deployment Steps

### 1. Local Testing (Optional but Recommended)

```powershell
# Restart dev server to pick up env changes
npm run dev
```

Then test in browser console at `http://localhost:3000/upload`:

```js
fetch('/api/ingest-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    contentTypes: ['blog', 'x_post']
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

✅ Should see: No CORS errors, proxy logs in terminal

---

### 2. Deploy to Vercel

#### Step 2a - Add Environment Variables in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **TWO** new variables (for Production, Preview, and Development):

```
N8N_INGEST_WEBHOOK_URL=https://vyx-n8n.onrender.com/webhook/ingest-content
N8N_CLIP_WEBHOOK_URL=https://vyx-n8n.onrender.com/webhook/clip-youtube
```

Keep existing (or add if missing):

```
NEXT_PUBLIC_INGEST_CONTENT_WEBHOOK=/api/ingest-content
NEXT_PUBLIC_CLIP_YOUTUBE_WEBHOOK=/api/clip-youtube
```

#### Step 2b - Deploy

```powershell
# Commit changes
git add .
git commit -m "fix: Add API proxy routes to resolve CORS issues"
git push origin main
```

Vercel will auto-deploy.

---

### 3. Verify Production

Once deployed, test at `https://vyx.vercel.app/upload`:

1. Open DevTools Console
2. Submit the form with a YouTube URL
3. ✅ Should see: **No CORS errors**
4. ✅ Network tab shows: `POST /api/ingest-content` (Status 200)

---

## 📋 What Changed

### Before (❌ CORS blocked):
```
Browser → https://vyx-n8n.onrender.com/webhook/ingest-content
          ↑
          Blocked by CORS preflight
```

### After (✅ Works):
```
Browser → https://vyx.vercel.app/api/ingest-content
          ↓ (server-side, no CORS)
          https://vyx-n8n.onrender.com/webhook/ingest-content
```

---

## 🔍 How to Debug Issues

### If proxy returns 500:
```powershell
# Check Vercel function logs
vercel logs --follow
```

Look for: `Missing N8N_INGEST_WEBHOOK_URL environment variable`

### If n8n returns error:
Test n8n directly (server-to-server, should work):

```powershell
curl.exe -X POST "https://vyx-n8n.onrender.com/webhook/ingest-content" `
  -H "Content-Type: application/json" `
  -d '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","contentTypes":["blog"]}'
```

### If frontend still calls old URL:
- Clear browser cache
- Check `process.env.NEXT_PUBLIC_INGEST_CONTENT_WEBHOOK` is set to `/api/ingest-content`
- Verify `.env.local` matches Vercel env vars

---

## 🎯 Expected Results

✅ No CORS errors in browser console
✅ Upload page works end-to-end
✅ Clips page continues to work
✅ All content generation functions properly

---

## 📞 If Issues Persist

1. Check Vercel env vars are set correctly (Settings → Environment Variables)
2. Check Vercel function logs: `vercel logs`
3. Verify n8n is responding: Direct curl test (see debug section)
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## 🧪 Quick Smoke Tests

### Test 1: Proxy Endpoint
```powershell
curl.exe -X POST "https://vyx.vercel.app/api/ingest-content" `
  -H "Content-Type: application/json" `
  -d '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","contentTypes":["blog"]}'
```

### Test 2: Browser Console (on vyx.vercel.app)
```js
fetch('/api/ingest-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    contentTypes: ['blog'] 
  })
}).then(r => r.text()).then(console.log)
```

### Test 3: End-to-End
1. Go to `https://vyx.vercel.app/upload`
2. Paste YouTube URL
3. Select content types
4. Click "Generate Content"
5. ✅ Should process without CORS errors

---

## ✨ Summary

The CORS issue is now **fixed** by routing all browser requests through Vercel API routes. The browser never directly calls Render/n8n, eliminating CORS entirely.

**Status:** Ready for deployment ✅
