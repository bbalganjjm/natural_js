/**
 * @natural-js/code - Utilities
 *
 * Utility functions for code processing.
 */

/**
 * Add sourceURL comment to script for better debugging
 *
 * This adds a //# sourceURL comment before the closing script tag,
 * which helps browser dev tools show the correct file name for dynamically loaded scripts.
 *
 * @param codes - HTML code containing script tags
 * @param sourceURL - URL to use as source identifier
 * @returns Modified code with sourceURL comment
 */
export function addSourceURL(codes: string, sourceURL: string): string {
  // Quick check for script content
  if (!codes.includes('<script')) {
    return codes;
  }

  // Find the last script closing tag position
  let cutIndex = codes.lastIndexOf('\n</script>');
  if (cutIndex < 0) {
    cutIndex = codes.lastIndexOf('\t</script>');
  }
  if (cutIndex < 0) {
    cutIndex = codes.lastIndexOf(' </script>');
  }
  if (cutIndex < 0) {
    cutIndex = codes.lastIndexOf('</script>');
  }

  if (cutIndex < 0) {
    return codes;
  }

  // Insert sourceURL comment before closing script tag
  return [
    codes.slice(0, cutIndex),
    '\n//# sourceURL=' + sourceURL + '\n',
    codes.slice(cutIndex),
  ].join('');
}

/**
 * Extract script content from HTML
 *
 * @param codes - HTML code containing script tags
 * @returns Array of script contents
 */
export function extractScripts(codes: string): string[] {
  const scripts: string[] = [];
  const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(codes)) !== null) {
    if (match[1]) {
      scripts.push(match[1].trim());
    }
  }

  return scripts;
}

/**
 * Check if code contains any script tags
 *
 * @param codes - Code to check
 * @returns True if script tags are found
 */
export function hasScript(codes: string): boolean {
  return codes.includes('<script');
}

/**
 * Get line number for a position in code
 *
 * @param codes - Full code string
 * @param position - Character position
 * @returns Line number (1-based)
 */
export function getLineNumber(codes: string, position: number): number {
  return codes.substring(0, position).split('\n').length;
}

export default {
  addSourceURL,
  extractScripts,
  hasScript,
  getLineNumber,
};

