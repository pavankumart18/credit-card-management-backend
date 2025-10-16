// AnimatedBackground.tsx (or place inline in dashboard.tsx)
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedBackground() {
    const reduce = useReducedMotion();

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            style={{ mixBlendMode: "normal" }}
        >
            {/* Moving angled gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(10,10,10,0.96) 0%, rgba(22,22,22,0.95) 40%, rgba(18,16,15,0.96) 100%)",
                    // subtle animated sheen created with pseudo-element replacement
                }}
            />

            {/* animated diagonal shimmer (CSS keyframe applied inline) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(120deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.0) 40%, rgba(255,255,255,0.02) 100%)",
                    transform: "skewX(-12deg)",
                    opacity: 0.6,
                    mixBlendMode: "overlay",
                    animation: reduce ? "none" : "moveShimmer 18s linear infinite",
                }}
            />

            {/* soft vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(80% 60% at 10% 10%, rgba(255,235,59,0.03), transparent 12%), radial-gradient(70% 60% at 90% 90%, rgba(0,0,0,0.35), transparent 25%)",
                    mixBlendMode: "multiply",
                }}
            />

            {/* Floating blurred yellow blobs (Framer Motion) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    aria-hidden
                    className="absolute rounded-full blur-3xl"
                    style={{
                        width: 420,
                        height: 420,
                        left: "-8%",
                        top: "-18%",
                        background:
                            "radial-gradient(circle at 30% 30%, rgba(250,204,21,0.15), rgba(250,204,21,0.07) 40%, transparent 60%)",
                        pointerEvents: "none",
                        mixBlendMode: "screen",
                        animation: reduce ? "none" : "float1 10s ease-in-out infinite",
                    }}
                />
                <motion.div
                    aria-hidden
                    className="absolute rounded-full blur-2xl"
                    style={{
                        width: 320,
                        height: 320,
                        right: "-6%",
                        bottom: "-10%",
                        background:
                            "radial-gradient(circle at 70% 70%, rgba(245,158,11,0.12), rgba(250,204,21,0.06) 40%, transparent 60%)",
                        pointerEvents: "none",
                        mixBlendMode: "screen",
                        animation: reduce ? "none" : "float2 14s ease-in-out infinite",
                    }}
                />
            </motion.div>

            {/* minimal subtle noise overlay via data URI (very low opacity) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.8' numOctaves='2' stitchTiles='stitch' /></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.03' /></svg>\")",
                    opacity: 0.06,
                    mixBlendMode: "overlay",
                    pointerEvents: "none",
                }}
            />

            {/* Inline keyframes for animation (add to global CSS or tailwind styles) */}
            <style>{`
        @keyframes moveShimmer {
          0% { transform: translateX(-30%) skewX(-12deg); }
          50% { transform: translateX(30%) skewX(-12deg); }
          100% { transform: translateX(-30%) skewX(-12deg); }
        }
        @keyframes float1 {
          0% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(16px) translateX(8px) scale(1.02); }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(-14px) translateX(-6px) scale(0.98); }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
      `}</style>
        </div>
    );
}
