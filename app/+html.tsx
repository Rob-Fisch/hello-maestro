// [AGENT NOTIFICATION] The user says the PWA is running.
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 
          Disable body scrolling on web. This makes the experience feel more like a native app.
          Managed with ScrollViewStyleReset from expo-router.
        */}
        <ScrollViewStyleReset />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.global = window;
              window.process = { env: {} };
              window.onerror = function(msg, url, line, col, error) {
                console.error('CRITICAL PWA ERROR:', msg, 'at', line, ':', col);
                alert('PWA CRASH: ' + msg);
              };
              console.log('HTNL Debugger Active');
            `,
          }}
        />
      </head>
      <body>
        {children}
        {/* 
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
                    }}
                />
                */}
      </body>
    </html>
  );
}
