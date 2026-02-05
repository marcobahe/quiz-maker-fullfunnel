/**
 * YouTube URL detection and embed helpers.
 *
 * Supported formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://youtube.com/watch?v=VIDEO_ID
 *   (with optional extra params / timestamps)
 */

const YT_RE =
  /(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([\w-]{11})/i;

/** Return the 11-char video id, or null if the URL isn't YouTube. */
export function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(YT_RE);
  return m ? m[1] : null;
}

/** Embed URL for an iframe player (no-cookie domain for privacy). */
export function youtubeEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/** High-quality thumbnail (480 × 360). */
export function youtubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
