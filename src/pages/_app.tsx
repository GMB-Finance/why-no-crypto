// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import localFont from 'next/font/local';
import '../globals.css';

// Define the custom Now font with corrected paths
const now = localFont({
    src: [
        {
            path: '../../public/fonts/now/Now-Thin.otf',
            weight: '100', // Thin
            style: 'normal',
        },
        {
            path: '../../public/fonts/now/Now-Light.otf',
            weight: '300', // Light
            style: 'normal',
        },
        {
            path: '../../public/fonts/now/Now-Regular.otf',
            weight: '400', // Regular
            style: 'normal',
        },
        {
            path: '../../public/fonts/now/Now-Medium.otf',
            weight: '500', // Medium
            style: 'normal',
        },
        {
            path: '../../public/fonts/now/Now-Bold.otf',
            weight: '700', // Bold
            style: 'normal',
        },
        {
            path: '../../public/fonts/now/Now-Black.otf',
            weight: '900', // Black
            style: 'normal',
        },
        // Now Alt variants
        {
            path: '../../public/fonts/now/NowAlt-Thin.otf',
            weight: '100', // Thin
            style: 'italic',
        },
        {
            path: '../../public/fonts/now/NowAlt-Light.otf',
            weight: '300', // Light
            style: 'italic',
        },
        {
            path: '../../public/fonts/now/NowAlt-Regular.otf',
            weight: '400', // Regular
            style: 'italic',
        },
        {
            path: '../../public/fonts/now/NowAlt-Medium.otf',
            weight: '500', // Medium
            style: 'italic',
        },
        {
            path: '../../public/fonts/now/NowAlt-Bold.otf',
            weight: '700', // Bold
            style: 'italic',
        },
        {
            path: '../../public/fonts/now/NowAlt-Black.otf',
            weight: '900', // Black
            style: 'italic',
        },
    ],
    display: 'swap', // Fallback font until custom font loads
});

// Define the custom Zyzol font with corrected paths
const zyzol = localFont({
    src: [
        {
            path: '../../public/fonts/Zyzol/ZyzolOutline-OVr46.otf',
            weight: '400', // Assuming Outline as Regular weight for consistency
            style: 'normal', // Assuming normal style (could be adjusted to 'italic' if needed)
        },
    ],
    display: 'swap', // Fallback font until custom font loads
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Why Not Crypto?</title>
                <link rel="icon" type="image/svg+xml" href="/avatar.svg" />
            </Head>
            <main className={now.className}> {/* Use only now.className for global font */}
                <Component {...pageProps} />
            </main>
        </>
    );
}

export default MyApp;