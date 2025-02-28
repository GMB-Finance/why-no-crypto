import { motion } from "framer-motion";

interface MessageProps {
    text: string;
    sender: "user" | "ai";
}

export default function Message({ text, sender }: MessageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: sender === "ai" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-2 rounded-md ${
                sender === "ai" ? "bg-gray-700" : "bg-blue-500 text-white"
            }`}
        >
            {text}
        </motion.div>
    );
}
