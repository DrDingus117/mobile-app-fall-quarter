// Rewrites links that open the app from outside (adb, a message, another app).
//   mywalks://walk/101  ->  /walk/101
//   mywalks://walk/     ->  /walk          (missing ID)
//   anything else       ->  left alone, so unknown links reach +not-found
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    // Remove "mywalks://" (or any scheme), then any ?query or #hash
    const withoutScheme = path.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    const cleanPath = withoutScheme.split(/[?#]/)[0];
    const segments = cleanPath.split('/').filter(Boolean);

    if (segments[0] === 'walk') {
      return segments[1] ? `/walk/${segments[1]}` : '/walk';
    }

    return path;
  } catch {
    // Never crash inside this function
    return '/';
  }
}
