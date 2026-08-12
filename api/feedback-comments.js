const { put, get } = require('@vercel/blob');
const crypto = require('crypto');

// One JSON blob per prototype (feedback/<prototypeId>.json) rather than one
// global blob — keeps each prototype's comment thread independent and the
// read-modify-write cheap even as more prototypes adopt the widget.
const BLOB_PREFIX = 'feedback/';

const MAX_TEXT_LENGTH = 1000;
const MAX_FIELD_LENGTH = 100;
const ID_PATTERN = /^[a-z0-9_-]+$/i;

function blobPath(prototypeId) {
  return `${BLOB_PREFIX}${prototypeId}.json`;
}

async function readComments(prototypeId) {
  // useCache:false — this is a read-modify-write; a stale CDN-cached read
  // would silently drop concurrent submissions or resolve/unresolve edits.
  const existing = await get(blobPath(prototypeId), { access: 'private', useCache: false });
  if (!existing || !existing.stream) return [];
  const raw = await new Response(existing.stream).text();
  let comments = [];
  try { comments = JSON.parse(raw); } catch { comments = []; }
  return Array.isArray(comments) ? comments : [];
}

async function writeComments(prototypeId, comments) {
  await put(blobPath(prototypeId), JSON.stringify(comments), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
  });
}

// Reading and resolving comments is admin-only — anyone with the prototype
// link can still submit feedback (POST), but only whoever holds this token
// can see what's been submitted. Keeps it a one-way "suggestion box" rather
// than a shared thread visible to every reviewer.
function isAdmin(req) {
  return !!process.env.FEEDBACK_ADMIN_TOKEN && req.query.token === process.env.FEEDBACK_ADMIN_TOKEN;
}

module.exports = async function handler(req, res) {
  const prototypeId = typeof req.query.prototypeId === 'string' ? req.query.prototypeId : '';
  if (!prototypeId || !ID_PATTERN.test(prototypeId)) {
    res.status(400).json({ error: 'A valid prototypeId query param is required' });
    return;
  }

  try {
    if (req.method === 'GET') {
      if (!isAdmin(req)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const comments = await readComments(prototypeId);
      res.status(200).json({ comments });
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      const screenId = typeof body.screenId === 'string' ? body.screenId.slice(0, MAX_FIELD_LENGTH) : null;
      const xPct = Number(body.xPct);
      const yPct = Number(body.yPct);

      if (!text) {
        res.status(400).json({ error: 'text is required' });
        return;
      }
      if (!Number.isFinite(xPct) || !Number.isFinite(yPct)) {
        res.status(400).json({ error: 'xPct and yPct must be numbers' });
        return;
      }

      const comment = {
        id: crypto.randomUUID(),
        screenId,
        xPct: Math.min(100, Math.max(0, xPct)),
        yPct: Math.min(100, Math.max(0, yPct)),
        text: text.slice(0, MAX_TEXT_LENGTH),
        author: typeof body.author === 'string' ? body.author.trim().slice(0, MAX_FIELD_LENGTH) : null,
        targetLabel: typeof body.targetLabel === 'string' ? body.targetLabel.slice(0, MAX_FIELD_LENGTH) : null,
        status: 'open',
        createdAt: new Date().toISOString(),
      };

      const comments = await readComments(prototypeId);
      comments.push(comment);
      await writeComments(prototypeId, comments);

      res.status(200).json({ comment });
      return;
    }

    if (req.method === 'PATCH') {
      if (!isAdmin(req)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const body = req.body || {};
      const id = typeof body.id === 'string' ? body.id : '';
      const status = body.status === 'resolved' ? 'resolved' : body.status === 'open' ? 'open' : null;
      if (!id || !status) {
        res.status(400).json({ error: 'id and a valid status are required' });
        return;
      }

      const comments = await readComments(prototypeId);
      const comment = comments.find((c) => c.id === id);
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }
      comment.status = status;
      await writeComments(prototypeId, comments);

      res.status(200).json({ comment });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('feedback-comments failed', err);
    res.status(500).json({ error: 'Request failed' });
  }
};
