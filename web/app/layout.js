import './globals.css';

export const metadata = {
  title: 'SleepyHead Hunter — AI-Powered Drowsiness Detection Alarm',
  description:
    'Stop falling asleep at your desk. SleepyHead Hunter uses real-time AI eye-tracking (MediaPipe) to detect when you doze off and blasts an escalating voice alarm to wake you up.',
  keywords: ['drowsiness detection', 'eye tracking', 'alarm', 'mediapipe', 'sleep detection', 'driver safety'],
  openGraph: {
    title: 'SleepyHead Hunter',
    description: 'AI-powered drowsiness detection that yells at you to wake up.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>😴</text></svg>" />
      </head>
      <body>
        <div className="stars-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
