export function initErrorReporter() {
  if (typeof window === 'undefined') return;

  const url = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;
  if (!url) return;

  const appId =
    process.env.NEXT_PUBLIC_APP_ID ||
    (() => {
      const m = window.location.hostname.match(/^preview-([^.]+)/);
      return m ? m[1] : window.location.hostname;
    })();

  const send = (message: string, stack?: string) => {
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId,
          message,
          stack: stack || '',
          url: window.location.href,
          user_agent: navigator.userAgent,
        }),
      }).catch(() => {});
    } catch {}
  };

  window.onerror = (msg, _src, _line, _col, err) => {
    send(String(msg), err?.stack);
  };
  window.onunhandledrejection = (e) => {
    send(e.reason?.message || String(e.reason), e.reason?.stack);
  };

  const origError = console.error;
  console.error = (...args: any[]) => {
    send(args.map(String).join(' '));
    origError.apply(console, args);
  };
}