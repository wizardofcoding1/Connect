/**
 * Proxy endpoint for large file uploads
 * Runs on same domain (vercel.app) - hides backend URL from frontend
 * Frontend calls /api/large-file-upload/* → forwarded to backend /api/*
 */
export default async function handler(req, res) {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  if (!BACKEND_URL) {
    return res.status(500).json({
      success: false,
      error: 'Backend not configured'
    });
  }

  try {
    // Extract the path after /api/large-file-upload
    // /api/large-file-upload/upload-to-release → /api/upload-to-release
    // Split the query off first: the path capture would otherwise swallow it
    // and it would then be appended a second time.
    const [rawPath, queryString = ''] = req.url.split('?');
    const pathMatch = rawPath.match(/\/api\/large-file-upload(.*)$/);
    const targetPath = pathMatch ? pathMatch[1] : '';

    const backendUrl = `${BACKEND_URL}/api${targetPath}${queryString ? '?' + queryString : ''}`;

    console.log(`[Proxy] ${req.method} ${req.url} → ${backendUrl}`);

    // Build headers
    const headers = {
      'Authorization': req.headers.authorization || ''
    };

    // Only set Content-Type if not FormData (FormData sets its own boundary)
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      headers['Content-Type'] = 'application/json';
    }

    // Handle request body
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      // If FormData, send as-is; otherwise JSON stringify
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        body = req.body;
      } else {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }

    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers: headers,
      body: body,
      // Media routes answer with a 302 to short-lived storage. Pass it back to
      // the browser rather than following it here: a serverless function's
      // response cap is far smaller than the files being served.
      redirect: 'manual'
    });

    const location = backendResponse.headers.get('location');
    if (location && backendResponse.status >= 300 && backendResponse.status < 400) {
      res.setHeader('Location', location);
      return res.status(backendResponse.status).end();
    }

    const responseText = await backendResponse.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('[Proxy] Response not JSON:', responseText.substring(0, 200));
      return res.status(backendResponse.status).json({
        success: false,
        error: 'Backend returned non-JSON response',
        status: backendResponse.status
      });
    }

    res.status(backendResponse.status).json(responseData);
  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Proxy request failed: ' + error.message
    });
  }
}
