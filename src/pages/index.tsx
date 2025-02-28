import Head from 'next/head';
import ChatContainer from "../components/ChatContainer";
import Chat from "../components/Chat";

export default function Home() {
    return (
        <>
            <Head>
                <title>Why No Crypto? | GM Base</title>
                <link rel="icon" type="image/svg+xml" href="/avatar.svg" />
            </Head>
            <ChatContainer>
                <Chat />
            </ChatContainer>
        </>
    );
}