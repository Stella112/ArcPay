"use client";

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div style={{ padding: '50px', background: 'red', color: 'white', fontFamily: 'monospace', zIndex: 9999, position: 'relative' }}>
      <h1>Client Crash Intercepted!</h1>
      <h2>{error.name}: {error.message}</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{error.stack}</pre>
    </div>
  );
}
