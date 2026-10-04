/**
 * Computes the SHA-256 cryptographic hash of a File or ArrayBuffer
 * using the standard browser Web Cryptography API (crypto.subtle).
 * 
 * Returns a 64-character lowercase hexadecimal hash.
 */
export async function computeFileSHA256(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return computeBufferSHA256(arrayBuffer);
}

export async function computeBufferSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Helper to format bytes into readable KB/MB/GB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Truncate hash for readable display (e.g., e3b0...b855)
 */
export function truncateHash(hash: string, lead = 8, trail = 8): string {
  if (!hash) return '';
  if (hash.length <= lead + trail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}
