/**
 * Service for large file uploads.
 *
 * Small JSON calls (list, rename, delete, sign) go through the same-origin
 * proxy, which keeps the backend URL out of those requests.
 *
 * The upload itself cannot: a Vercel serverless function rejects request
 * bodies over ~4.5MB with 413, so a multi-hundred-MB file has to reach the
 * backend directly. Credentials still never leave the server — the browser
 * only learns an address, and every route behind it still requires auth.
 */

const isDev = import.meta.env.DEV;

const stripSlash = (url) => (url || '').replace(/\/+$/, '');

// The backend's real origin, used in both dev and production
const DIRECT_BASE =
  stripSlash(import.meta.env.VITE_BACKEND_URL) || 'http://localhost:5000';

const API_BASE = isDev ? DIRECT_BASE : '/api/large-file-upload';

/**
 * Upload file to backend → GitHub Releases (via secure proxy)
 */
export async function uploadLargeFile(file, tabId = null, onProgress = null) {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('file', file);
  if (tabId) {
    formData.append('tabId', tabId);
  }

  const { supabase } = await import('../supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percent: percentComplete
          });
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error));
          }
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || `Upload failed: ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Always direct to the backend, never through the proxy: Vercel caps
    // serverless request bodies at ~4.5MB and answers 413 above that.
    // Note: Don't set Content-Type header - browser will set it with boundary for FormData
    xhr.open('POST', `${DIRECT_BASE}/api/upload-to-release`);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.send(formData);

    uploadLargeFile.currentXhr = xhr;
  });
}

/**
 * Get large files for a tab (secure proxy)
 */
export async function getLargeFilesByTab(tabId) {
  if (!tabId) throw new Error('Tab ID required');

  const { supabase } = await import('../supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  // In dev: append /api; in prod: use proxy base as-is
  const url = isDev ? `${API_BASE}/api/files/${tabId}` : `${API_BASE}/files/${tabId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Delete large file (secure proxy)
 */
export async function deleteLargeFile(fileId) {
  if (!fileId) throw new Error('File ID required');

  const { supabase } = await import('../supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  // In dev: append /api; in prod: use proxy base as-is
  const url = isDev ? `${API_BASE}/api/files/${fileId}` : `${API_BASE}/files/${fileId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

/**
 * Cancel upload in progress
 */
export function cancelLargeFileUpload() {
  if (uploadLargeFile.currentXhr) {
    uploadLargeFile.currentXhr.abort();
    uploadLargeFile.currentXhr = null;
  }
}

/**
 * Format bytes to readable size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Ask the backend for a short-lived signed streaming URL.
 *
 * The storage repo is private, so GitHub's browser_download_url 404s for the
 * browser. Bytes are routed through the backend, which authenticates with the
 * GitHub token server-side. The URL is HMAC-signed and expires, so it can't be
 * shared or reused indefinitely.
 */
export async function getStreamUrl(fileId) {
  if (!fileId) throw new Error('File ID required');

  const { supabase } = await import('../supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const url = isDev
    ? `${API_BASE}/api/files/${fileId}/stream-url`
    : `${API_BASE}/files/${fileId}/stream-url`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Could not sign stream URL: ${response.status}`);
  }

  const { data } = await response.json();

  // `path` is same-origin in production; dev needs the backend host prepended
  return isDev ? `${API_BASE}${data.path}` : data.path.replace('/api', API_BASE);
}

/**
 * Rename a file's display title. Pass an empty string to clear it and fall
 * back to the original file name.
 */
export async function renameLargeFile(fileId, title) {
  if (!fileId) throw new Error('File ID required');

  const { supabase } = await import('../supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const url = isDev ? `${API_BASE}/api/files/${fileId}` : `${API_BASE}/files/${fileId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Rename failed: ${response.status}`);
  }

  return await response.json();
}
