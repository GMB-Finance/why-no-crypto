// src/components/InputBox.tsx
interface InputBoxProps {
    input: string;
    setInput: (value: string) => void;
    sendMessage: () => void;
    loading: boolean;
}

export default function InputBox({ input, setInput, sendMessage, loading }: InputBoxProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-gray-800 p-3 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
                onClick={sendMessage}
                className="bg-white text-blue-500 p-2 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500"
                disabled={loading}
                aria-label="Send message"
            >
                {loading ? "..." : "→"}
            </button>
        </div>
    );
}