import fs from 'node:fs';

const token = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_PAT || '';
const projectRef = process.env.SUPABASE_PROJECT_ID || 'reddqagusyulincidroz';

if (!token) {
  console.error('Error: Please provide SUPABASE_ACCESS_TOKEN or SUPABASE_PAT environment variable.');
  process.exit(1);
}

const functions = [
  {
    slug: 'checkout-order',
    name: 'checkout-order',
    filePath: 'supabase/functions/checkout-order/index.ts',
    verify_jwt: false
  },
  {
    slug: 'vase-life-check',
    name: 'vase-life-check',
    filePath: 'supabase/functions/vase-life-check/index.ts',
    verify_jwt: false
  }
];

// Check existing functions
const listRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/functions`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const existing = await listRes.json();
const existingSlugs = new Set(Array.isArray(existing) ? existing.map(f => f.slug) : []);

for (const fn of functions) {
  const code = fs.readFileSync(fn.filePath, 'utf8');
  const exists = existingSlugs.has(fn.slug);
  const url = exists 
    ? `https://api.supabase.com/v1/projects/${projectRef}/functions/${fn.slug}`
    : `https://api.supabase.com/v1/projects/${projectRef}/functions`;
  const method = exists ? 'PATCH' : 'POST';

  console.log(`${exists ? 'Updating' : 'Creating'} Edge Function: ${fn.slug}...`);

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      slug: fn.slug,
      name: fn.name,
      body: code,
      verify_jwt: fn.verify_jwt
    })
  });

  const resData = await res.json();
  console.log(`[${fn.slug}] Status ${res.status}:`, resData?.id ? `Deployed ID: ${resData.id}` : resData);
}

