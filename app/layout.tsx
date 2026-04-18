import type { Metadata } from 'next';
import './globals.css';
import { ThemeSwitch } from '@/components/ThemeSwitch';

export const metadata: Metadata = {
  title: 'Madrasa AI — اسأل البودكاست',
  description:
    'مساعدٌ ذكيٌّ استمع نيابةً عنك إلى كل حلقات «مدرسة الاستثمار». اطرح سؤالك واحصل على إجابةٍ مستخلَصةٍ من الحلقات مع مصادر دقيقة.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          // Avoid FOUC when hydrating user's previously-chosen theme.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('madrasa-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <ThemeSwitch />
      </body>
    </html>
  );
}
