const { get } = require('@vercel/blob');

const BLOB_PATH = 's2-submissions.json';

// Gated by a shared-secret query param (S2_EXPORT_TOKEN env var) so the
// collected free-text submissions aren't readable by anyone who guesses the
// route — this is research data, not a public asset.
module.exports = async function handler(req, res) {
  const token = req.query.token;
  if (!process.env.S2_EXPORT_TOKEN || token !== process.env.S2_EXPORT_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    // useCache:false so a review always reflects the latest writes/deletes.
    const existing = await get(BLOB_PATH, { access: 'private', useCache: false });
    if (!existing || !existing.stream) {
      res.status(200).json({ count: 0, submissions: [] });
      return;
    }

    const raw = await new Response(existing.stream).text();
    let records = [];
    try { records = JSON.parse(raw); } catch { records = []; }
    if (!Array.isArray(records)) records = [];

    res.status(200).json({ count: records.length, submissions: records });
  } catch (err) {
    console.error('export-s2-inputs failed', err);
    res.status(500).json({ error: 'Failed to export' });
  }
};
