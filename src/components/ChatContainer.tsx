// src/components/ChatContainer.tsx
import { ReactNode } from "react";

interface ChatContainerProps {
    children: ReactNode;
}

export default function ChatContainer({ children }: ChatContainerProps) {
    return (
        <div className="text-white" style={{ padding: "0", margin: "0" }}>
            {children}
        </div>
    );
}