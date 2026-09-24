const { put, get } = require('@vercel/blob');

// Single aggregate JSON blob (read-modify-write) rather than one blob per
// submission — simpler to export, and fine for this prototype's traffic
// (a handful of testers, not concurrent global write load).
const BLOB_PATH = 's2-submissions.json';

// Server-side ceiling, independent of the UI's own 150-char cap — never
// trust the client.
const MAX_TEXT_LENGTH = 1000;
const MAX_FIELD_LENGTH = 100;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const record = {
    text: text.slice(0, MAX_TEXT_LENGTH),
    vertical: typeof body.vertical === 'string' ? body.vertical.slice(0, MAX_FIELD_LENGTH) : null,
    industry: typeof body.industry === 'string' ? body.industry.slice(0, MAX_FIELD_LENGTH) : null,
    createdAt: new Date().toISOString(),
  };

  try {
    let records = [];
    // useCache:false — this is a read-modify-write; a stale CDN-cached read
    // would silently drop concurrent submissions.
    const existing = await get(BLOB_PATH, { access: 'private', useCache: false });
    if (existing && existing.stream) {
      const raw = await new Response(existing.stream).text();
      try { records = JSON.parse(raw); } catch { records = []; }
      if (!Array.isArray(records)) records = [];
    }

    records.push(record);

    await put(BLOB_PATH, JSON.stringify(records), {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('save-s2-input failed', err);
    res.status(500).json({ error: 'Failed to save' });
  }
};
