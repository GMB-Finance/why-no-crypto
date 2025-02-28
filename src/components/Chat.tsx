// src/components/Chat.tsx
import { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion"; // Import Variants type explicitly
import axios from "axios";

import styles from './Chat.module.css';

export default function Chat() {
    const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
        [],
    );
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isFirstMessage, setIsFirstMessage] = useState(true);
    const [isOverflowing, setIsOverflowing] = useState(false); // Track overflow state
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false); // State to track mobile view

    // Detect mobile screen size
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleResize = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };
        setIsMobile(mediaQuery.matches); // Set initial value
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: "user" }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        if (isFirstMessage) {
            setIsFirstMessage(false);
        }

        try {
            // Temporarily add a loading message to show the typing animation
            setMessages([...newMessages, { text: "", sender: "ai" }]);
            const res = await axios.post("/api/chat", { message: input });
            // Replace the loading message with the actual AI response
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = { text: res.data.response, sender: "ai" };
                return updatedMessages;
            });
        } catch (error) {
            console.error("Error fetching AI response:", error);
            // Remove the loading message if there's an error
            setMessages(newMessages);
        } finally {
            setLoading(false); // Ensure loading state is cleared after the response or error
        }
    };

    const resetChat = () => {
        setMessages([]); // Clear all messages
        setInput(""); // Clear the input field
        setIsFirstMessage(true); // Reset to initial state
        setLoading(false); // Ensure loading state is off
    };

    // Check for overflow and scroll position, update fade state
    useEffect(() => {
        const checkOverflowAndScroll = () => {
            if (chatContainerRef.current) {
                const container = chatContainerRef.current;
                const hasOverflow = container.scrollHeight > container.clientHeight;
                const isAtTop = container.scrollTop === 0; // Check if scrolled to the top
                setIsOverflowing(hasOverflow && !isAtTop); // Only set true if overflowing and not at the top
            }
        };

        // Initial check
        checkOverflowAndScroll();

        // Handle scroll events
        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener("scroll", checkOverflowAndScroll);
        }

        // Debounce for performance during resize
        const observer = new ResizeObserver(() => checkOverflowAndScroll());
        if (container) {
            observer.observe(container);
        }

        // Cleanup
        return () => {
            if (container) {
                container.removeEventListener("scroll", checkOverflowAndScroll);
            }
            observer.disconnect();
        };
    }, [messages]); // Re-run when messages change

    useEffect(() => {
        if (lastMessageRef.current) { // Type guard to ensure the element exists
            (lastMessageRef.current as HTMLElement).scrollIntoView({ behavior: "smooth" }); // Explicitly cast to HTMLElement
        }
    }, [messages]);

    useEffect(() => {
        console.log(
            "Chat container height:",
            chatContainerRef.current?.offsetHeight,
        );
    }, [isFirstMessage, messages]);

    // Typing animation variants for the loading state (three dots pulsing)
    const typingVariants: Variants = { // Explicitly type as Variants
        initial: { opacity: 0 },
        animate: {
            opacity: [0.5, 1, 0.5],
            transition: {
                repeat: Infinity,
                repeatType: "loop" as const, // Use "loop" as a literal type to match Framer Motion's enum
                duration: 0.8,
                ease: "easeInOut",
            },
        },
    };

    // Handler for mouse enter to replace ResetButton SVG with outlined version
    const handleResetButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        const img = e.currentTarget.querySelector('img');
        if (img) {
            img.src = "/ResetButton-outline.svg"; // Replace with outlined SVG on hover
        }
    };

    // Handler for mouse leave to revert ResetButton SVG to original
    const handleResetButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        const img = e.currentTarget.querySelector('img');
        if (img) {
            img.src = "/ResetButton.svg"; // Revert to original SVG on leave
        }
    };

    // Handler for mouse enter to replace Telegram Bot button SVG with outlined version
    const handleTgBotButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        const img = e.currentTarget.querySelector('img');
        if (img) {
            img.src = "/tgbot-outline.svg"; // Replace with outlined SVG on hover
        }
    };

    // Handler for mouse leave to revert Telegram Bot button SVG to original
    const handleTgBotButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        const img = e.currentTarget.querySelector('img');
        if (img) {
            img.src = "/tgbot.svg"; // Revert to original SVG on leave
        }
    };

    return (
        <div style={{ backgroundColor: "black", color: "white", width: "100vw", height: "100vh", overflow: "hidden", position: "fixed" }}>
            {/* Smaller Top Gradient Bar */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "5px", // Reduced from 60px to 50px (adjust as needed)
                    background: "linear-gradient(to right, #3b52fe, #1dfea2, #aaffb8, #3b52fe)",
                    zIndex: 30, // Highest z-index to stay on top
                }}
            />

            {/* Main Content (Title in Initial View, Lowered Slightly on Desktop) */}
            {isFirstMessage && (
                <motion.h1
                    style={{ 
                        marginTop: isMobile ? "55%" : "15%", // Lowered to 200px on desktop initial view, 170px on mobile
                        textAlign: "center", 
                        fontWeight: "500", 
                        fontSize: "25px", 
                        marginBottom: "16px", 
                        marginLeft: "auto", 
                        marginRight: "auto",
                        width: isMobile ? "90%" : "100%",
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    I'm curious <br />
                    Why are you not in crypto yet?
                </motion.h1>
            )}

            {/* Fixed-Size Chat Container with Internal Scrolling (Using Inline CSS, 50% Width on Desktop, Percentage Height on Both Mobile and Desktop, Left-Aligned Content) */}
            <motion.div
                ref={chatContainerRef}
                className={`${styles['iosScrollbar']} ${isMobile ? styles['mobileChatContainer'] : styles['desktopChatContainer']}`} // Use desktop class for non-mobile
                style={{
                    padding: "16px", // 4px padding equivalent
                    borderRadius: "12px", // Rounded edges (optional, can remove if no background)
                    // Removed backgroundColor and boxShadow for transparency
                    overflowY: "auto", // Enable vertical scrolling
                    overflowX: "hidden", // Prevent horizontal scrolling
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px", // Gap between messages
                    position: "absolute", // Use absolute positioning for precise control
                    top: isFirstMessage ? "0" : "70px", // Adjusted from 120px to 110px to account for smaller top bar
                    left: isMobile ? "0" : "25%", // Full width on mobile, 50% on desktop
                    width: isMobile ? "100%" : "50%", // Full width on mobile, 50% on desktop
                    height: isFirstMessage ? "0" : (isMobile ? "55%" : "60%"), // Use 55% height on mobile, 60% height on desktop
                    maxHeight: isFirstMessage ? "0" : (isMobile ? "55%" : "60%"), // Enforce 55% max-height on mobile, 60% max-height on desktop
                    paddingBottom: "20px", // Consistent padding for cleaner look
                    margin: "0", // Remove margins for precise positioning
                    zIndex: "10", // Above initial content, below input and bars
                    boxSizing: "border-box", // Ensure padding doesn’t affect height
                    visibility: isFirstMessage ? "hidden" : "visible", // Hide visually in initial view to prevent empty bar
                    // Conditional fade-out mask (only when overflowing and not at the top)
                    WebkitMaskImage: isOverflowing ? "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%)" : "none", // Fade in from transparent to opaque over 20% of height when overflowing and not at top
                    maskImage: isOverflowing ? "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%)" : "none", // Standard mask for modern browsers when overflowing and not at top
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isFirstMessage ? 0 : 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        ref={i === messages.length - 1 ? lastMessageRef : null}
                        initial={{ opacity: 0, x: msg.sender === "ai" ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            padding: "8px", // 2px padding equivalent
                            borderRadius: "6px", // Rounded edges
                            marginBottom: "10px",
                            color: msg.sender === "user" ? "rgba(253, 254, 255, 0.8)" : "rgba(253, 254, 255, 1)", // Brighter dimmer font for user, full brightness for AI
                            maxWidth: "100%", // Limit the width to fit within container, left-aligned
                            wordWrap: "break-word", // Break long words to prevent horizontal overflow
                            whiteSpace: "pre-wrap", // Preserve whitespace and wrap text
                        }}
                    >
                        {msg.sender === "ai" ? (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                <img
                                    src="/avatar.svg" // Path to the SVG in public directory
                                    alt="AI Avatar"
                                    style={{
                                        width: "24px", // Adjust size as needed (e.g., 24px for a small avatar)
                                        height: "24px", // Match width for a square avatar
                                        objectFit: "contain", // Ensure the SVG fits within the dimensions
                                        marginTop: "2px", // Slight adjustment for vertical alignment with text
                                    }}
                                />
                                {msg.text ? (
                                    <span style={{ lineHeight: "1.5", display: "block", width: "100%" }}>
                                        {msg.text}
                                    </span>
                                ) : loading && i === messages.length - 1 ? (
                                    <motion.div
                                        variants={typingVariants}
                                        initial="initial"
                                        animate="animate"
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "4px", // Space between dots
                                        }}
                                    >
                                        <span style={{ fontSize: "16px", color: "white" }}>.</span>
                                        <span style={{ fontSize: "16px", color: "white" }}>.</span>
                                        <span style={{ fontSize: "16px", color: "white" }}>.</span>
                                    </motion.div>
                                ) : null}
                            </div>
                        ) : (
                            <div style={{ paddingLeft: "36px" }}> {/* Add padding equal to avatar width (24px) + gap (12px) */}
                                <span style={{ lineHeight: "1.5", display: "block", width: "100%" }}>{msg.text}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>

            {/* Input Field and Buttons (Full Width, Reset and Telegram Bot Buttons on Separate Row Inside Gray Box, Reduced Bottom Padding, Wider on Mobile, Percentage Positioning on Desktop for Both Views, Unchanged on Conversation View) */}
            <motion.div
                className={`flex flex-col items-center gap-2 ${isMobile ? (isFirstMessage ? styles['mobileInputContainerInitial'] : styles['mobileInputContainerConversation']) : (isFirstMessage ? styles['desktopInputContainerInitial'] : styles['desktopInputContainer'])}`} // Use desktop classes for non-mobile
                initial={{ y: "0%" }}
                animate={{ y: isFirstMessage ? "0%" : "100%" }}
                transition={{ duration: 0.5 }}
                style={{
                    position: isFirstMessage ? "absolute" : "fixed",
                    bottom: isMobile ? (isFirstMessage ? "40%" : "200px") : (isFirstMessage ? "55%" : "45%"), // Lowered to 55% on desktop initial view (from 50%), keeping 45% on conversation
                    left: isMobile ? "5%" : "25%", // Full width on mobile, 50% on desktop
                    right: isMobile ? "10%" : "25%", // Full width on mobile, 50% on desktop
                    width: isMobile ? "80%" : "50%", // Full width on mobile, 50% on desktop
                    margin: "0 auto",
                    transform: isFirstMessage ? "translateY(50%)" : "none",
                    zIndex: "15", // Above chat container, below bars
                }}
            >
                <div style={{ width: "100%", position: "relative" }}>
                    <div
                        style={{
                            backgroundColor: "#1A1F23", // Light gray
                            padding: "12px 12px 6px 12px", // Reduced bottom padding from 12px to 6px
                            paddingTop: "20px", // Kept original top padding
                            borderRadius: "24px", // Rounded edges
                            position: "relative",
                            display: "flex",
                            flexDirection: "column", // Stack input and buttons vertically
                            gap: "8px", // Reverted to original gap to maintain spacing
                            width: "100%", // Full width of the container
                        }}
                    >
                        <input
                            type="text" // Fixed from `type: "text"` to `type="text"` for valid JSX
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            style={{
                                width: "100%", // Full width of the container
                                height: "100%",
                                backgroundColor: "transparent",
                                color: "rgba(253,254,255,255)",
                                border: "none",
                                outline: "none",
                                fontSize: "16px",
                                padding: "0", // Remove default padding to fit snugly
                            }}
                            placeholder="Type your argument here ..."
                            onKeyPress={e => e.key === "Enter" && sendMessage()}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}> {/* Container for both buttons with spacing */}
                                <button
                                    onClick={resetChat}
                                    style={{
                                        width: "auto", // Auto width to maintain aspect ratio
                                        height: "30px", // Match ResetButton height for consistency
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "transparent", // Transparent background for SVG
                                        border: "none", // Remove border
                                        padding: "0", // Remove any default padding
                                        margin: "0",
                                        cursor: "pointer",
                                        transition: "filter 0.3s ease", // Smooth transition for SVG replacement
                                    }}
                                    onMouseEnter={handleResetButtonMouseEnter} // Use the defined handler
                                    onMouseLeave={handleResetButtonMouseLeave} // Use the defined handler
                                >
                                    <img
                                        src="/ResetButton.svg" // Default SVG in public directory
                                        alt="Reset Chat"
                                        style={{
                                            height: "100%", // Match button height to maintain aspect ratio
                                            objectFit: "contain", // Maintain aspect ratio, fit within the height
                                            padding: "0", // Remove any image padding
                                            margin: "0", // Remove any image margin
                                            transition: "filter 0.3s ease", // Smooth transition for SVG replacement
                                        }}
                                    />
                                </button>
                                <a
                                    href="https://t.me/wyno_bot"
                                    target="_blank"
                                    rel="noopener noreferrer" // Security best practice for new tabs
                                    style={{ display: "block" }} // Ensure the link wraps the image properly
                                >
                                    <button
                                        style={{
                                            width: "auto", // Auto width to maintain aspect ratio
                                            height: "30px", // Match ResetButton height for consistency
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "transparent", // Transparent background for SVG
                                            border: "none", // Remove border
                                            padding: "0", // Remove any default padding
                                            margin: "0",
                                            cursor: "pointer",
                                            transition: "filter 0.3s ease", // Smooth transition for SVG replacement
                                        }}
                                        onMouseEnter={handleTgBotButtonMouseEnter} // Use the defined handler
                                        onMouseLeave={handleTgBotButtonMouseLeave} // Use the defined handler
                                    >
                                        <img
                                            src="/tgbot.svg" // Default SVG in public directory
                                            alt="Telegram Bot"
                                            style={{
                                                height: "100%", // Match button height to maintain aspect ratio
                                                objectFit: "contain", // Maintain aspect ratio, fit within the height
                                                padding: "0", // Remove any image padding
                                                margin: "0", // Remove any image margin
                                                transition: "filter 0.3s ease", // Smooth transition for SVG replacement
                                            }}
                                        />
                                    </button>
                                </a>
                            </div>
                            <button
                                onClick={sendMessage}
                                style={{
                                    width: "40px", // Fixed width for circular shape
                                    height: "40px", // Fixed height for circular shape
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "transparent", // Transparent background for image
                                    border: "none", // Remove border
                                    padding: "0", // Remove any default padding
                                    margin: "0",
                                    cursor: "pointer",
                                    opacity: loading ? 0.5 : 1, // Dim when loading (restored)
                                    pointerEvents: loading ? "none" : "auto", // Disable clicks when loading (restored)
                                }}
                                disabled={loading}
                            >
                                <img
                                    src="/arrow.png" // Replace with your arrow image
                                    alt="Send message"
                                    style={{
                                        width: "80%", // Fill the button area
                                        height: "80%", // Fill the button area
                                        objectFit: "contain", // Maintain aspect ratio, fit within 40x40px
                                        padding: "0", // Remove any image padding
                                        margin: "0", // Remove any image margin
                                    }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* "POWERED BY" Text and Images, Positioned Above Bottom Bar (Always Visible, with Links, Zyzol Font, Now for Other Text) */}
            <motion.div
                className={`flex flex-col items-center ${isMobile ? (isFirstMessage ? styles['mobilePoweredByContainerInitial'] : styles['mobilePoweredByContainerConversation']) : ''}`} // Bracket notation
                initial={{ y: "0%" }}
                animate={{ y: isFirstMessage ? "0%" : "100%" }}
                transition={{ duration: 0.5 }}
                style={{
                    position: "fixed",
                    bottom: "70px", // Default for desktop
                    left: isMobile ? "10%" : "20%", // Center 60% width on desktop, adjusted for 80% on mobile
                    right: isMobile ? "10%" : "20%", // Center 60% width on desktop, adjusted for 80% on mobile
                    width: isMobile ? "80%" : "60%", // 80% width on mobile, 60% on desktop
                    margin: "0 auto",
                    zIndex: "15", // Same as input, below bars
                }}
            >
                <div
                    className={isMobile ? styles['mobilePoweredByInner'] : ''}
                    style={{
                        marginTop: "8px", // mt-2 equivalent
                        display: "grid",
                        placeItems: "center", // Centers both horizontally and vertically
                        gap: "10px", // Space between text and images
                    }}
                >
                    <img
                        src="/poweredby.svg" // Replace with the SVG file
                        alt="Powered By"
                        style={{ width: "auto", height: "8px", objectFit: "contain" }} // Match the height of the original images for consistency
                    />
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <a
                            href="https://gmb.finance/"
                            target="_blank"
                            rel="noopener noreferrer" // Security best practice for new tabs
                            style={{ display: "block" }} // Ensure the link wraps the image properly
                        >
                            <img
                                src="/gm-base.png"
                                alt="GM Finance Logo"
                                style={{ width: "auto", height: "20px", objectFit: "contain" }} // Maintain aspect ratio with fixed height
                            />
                        </a>
                        <a
                            href="https://www.oracleframework.ai/"
                            target="_blank"
                            rel="noopener noreferrer" // Security best practice for new tabs
                            style={{ display: "block" }} // Ensure the link wraps the image properly
                        >
                            <img
                                src="/oracle2.png"
                                alt="Oracle Logo"
                                style={{ width: "auto", height: "20px", objectFit: "contain" }} // Same height as gm-base, maintain aspect ratio
                            />
                        </a>
                    </div>
                    <style>
                        {`
                /* Removed .powered-by-text styles since we're using an SVG now */
            `}
                    </style>
                </div>
            </motion.div>

            {/* Smaller Bottom Gradient Bar */}
            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "5px", // Reduced from 60px to 50px (adjust as needed)
                    background:
                        "linear-gradient(to right, #3b52fe, #1dfea2, #aaffb8, #3b52fe)",
                    zIndex: 30, // Highest z-index to stay on top
                }}
            />
        </div>
    );
}