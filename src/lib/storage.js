import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const BUCKET = "documents";
const SIGN_TTL_SECONDS = 3600; // Supabase signed URL lifetime
const CACHE_TTL_MS = 55 * 60 * 1000; // Re-sign a little before the URL actually lapses

// path -> { url, expiresAt }
const signedCache = new Map();
// path -> in-flight promise, so a grid of cards never signs the same object twice
const inFlight = new Map();

/**
 * Rows created before the bucket was made private store a full public URL.
 * Newer rows may store a bare storage path. Accept either and return the path.
 */
export const getStoragePathFromUrl = (urlOrPath) => {
  if (!urlOrPath) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  if (urlOrPath.includes(marker)) {
    return urlOrPath.split(marker)[1] || null;
  }

  const signedMarker = `/storage/v1/object/sign/${BUCKET}/`;
  if (urlOrPath.includes(signedMarker)) {
    return (urlOrPath.split(signedMarker)[1] || "").split("?")[0] || null;
  }

  // Already a bare storage path
  if (!urlOrPath.startsWith("http")) return urlOrPath;

  return null;
};

/**
 * Mint (or reuse) a short-lived signed URL for a stored object. The bucket is
 * private, so this is the only way to read a file, and the link stops working
 * once it lapses instead of being permanently public.
 */
export const getSignedUrl = async (urlOrPath) => {
  const path = getStoragePathFromUrl(urlOrPath);
  if (!path) return null;

  const cached = signedCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  if (inFlight.has(path)) {
    return inFlight.get(path);
  }

  const request = (async () => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGN_TTL_SECONDS);

      if (error || !data?.signedUrl) {
        console.warn("Could not sign storage object:", path, error?.message);
        return null;
      }

      signedCache.set(path, {
        url: data.signedUrl,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return data.signedUrl;
    } finally {
      inFlight.delete(path);
    }
  })();

  inFlight.set(path, request);
  return request;
};

/** Drop cached links for objects that no longer exist. */
export const forgetSignedUrls = (urlsOrPaths = []) => {
  for (const entry of urlsOrPaths) {
    const path = getStoragePathFromUrl(entry);
    if (path) signedCache.delete(path);
  }
};

/**
 * Resolve a stored URL/path into a usable signed link for rendering.
 * Returns null while signing is in flight, so callers can show a placeholder.
 */
export const useSignedUrl = (urlOrPath) => {
  const [signedUrl, setSignedUrl] = useState(() => {
    const path = getStoragePathFromUrl(urlOrPath);
    const cached = path && signedCache.get(path);
    return cached && cached.expiresAt > Date.now() ? cached.url : null;
  });

  useEffect(() => {
    if (!urlOrPath) {
      setSignedUrl(null);
      return;
    }

    let active = true;
    getSignedUrl(urlOrPath).then((resolved) => {
      if (active) setSignedUrl(resolved);
    });

    return () => {
      active = false;
    };
  }, [urlOrPath]);

  return signedUrl;
};
