export const metadata = {
  title: 'Growspeech AI Chatbot',
  description: 'Web & GrowLauncher AI Integration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, background: '#fff', color: '#333' }}>{children}</body>
    </html>
  );
}

