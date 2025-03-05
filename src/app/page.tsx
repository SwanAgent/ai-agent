"use client";

import AnimatedShinyText from "@/components/animated-shiny-text";
import BlurFade from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpenIcon } from "lucide-react";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { XLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useNearWallet } from "@/contexts/near-wallet";
import { generateExposedKeyPair } from "@/lib/wallet/wallet-generator";

export default function LandingPage() {
    const router = useRouter();
    const { accountId, wallet } = useNearWallet();
    const { data: session } = useSession();

    const handleLogin = async () => {
        try {
            const msg = "Welcome to SWAN DeFAI Agent";
            const csrfToken = await getCsrfToken();

            if (!csrfToken || !wallet || !wallet.signMessage) return;

            // Convert CSRF token to Uint8Array of length 32
            const encoder = new TextEncoder();
            const csrfBytes = encoder.encode(csrfToken);
            const nonce = new Uint8Array(32);
            nonce.set(csrfBytes.slice(0, 32)); // Ensure 32 byte length

            // Sign the message with the wallet
            const signedMessage = await wallet.signMessage({
                message: msg,
                nonce: Buffer.from(nonce),
                recipient: "http://localhost:3000"
            });

            const { publicKey, privateKey } = await generateExposedKeyPair();

            console.log("signedMessage", signedMessage, publicKey, privateKey);

            if (!signedMessage) return;

            const response = await signIn("credentials", {
                signature: signedMessage.signature,
                message: msg,
                redirect: false,
                accountId: signedMessage.accountId,
                publicKey: signedMessage.publicKey,
            });

            if (response?.ok) {
                router.push("/home");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    useEffect(() => {
        if (accountId && !session) {
            handleLogin();
        }
    }, [accountId, session]);

    return (
        <div className="relative flex flex-col items-center w-full justify-center min-h-screen bg-gradient-to-b from-background to-background/80">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-background bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
            <Header />
            <Hero />
            <Footer />
            {/* Optional: Add a subtle animation effect */}
            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
        </div>
    );
}

const navItems = [
    { label: "Github", href: "https://git.new/neur", icon: BookOpenIcon },
    { label: "Docs", href: "https://docs.neur.sh", icon: BookOpenIcon },
];

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { accountId, signIn: connectWallet, signOut: disconnectWallet } = useNearWallet();

    const handleLogin = async () => {
        if (accountId) {
            await disconnectWallet();
        } else {
            await connectWallet();
        }
    }

    return (
        <BlurFade
            delay={0.1}
            className="fixed top-0 left-0 right-0 w-full z-50"
        >
            <header>
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <div className="rounded-xl border border-border/50 bg-muted/70 shadow-lg backdrop-blur-md">
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="relative">
                                <Brand className="scale-95 transition-opacity hover:opacity-80" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="h-9 rounded-lg px-4 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                                    onClick={handleLogin}
                                >
                                    {accountId ? `${accountId}` : "Login with NEAR"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 md:hidden"
                                    onClick={() =>
                                        setIsMobileMenuOpen(!isMobileMenuOpen)
                                    }
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                    >
                                        <line x1="4" x2="20" y1="12" y2="12" />
                                        <line x1="4" x2="20" y1="6" y2="6" />
                                        <line x1="4" x2="20" y1="18" y2="18" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="absolute left-4 right-4 top-full mt-2 rounded-lg border border-border/50 bg-background/95 p-3 shadow-lg backdrop-blur-md md:hidden">
                            <nav className="flex flex-col gap-1.5">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </a>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </div>
            </header>
        </BlurFade>
    );
};

interface BrandProps {
    className?: string;
}

function Brand({ className }: BrandProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/logo/foam-logo.png"
                alt="swan.sh"
                className="w-8 h-8 rounded-lg"
            />
        </div>
    );
}

interface BrandProps {
    className?: string;
}

const Hero = () => {
    const productRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: productRef,
        offset: ["start end", "end start"],
    });

    const rotateX = useTransform(scrollYProgress, [0, 0.5], [30, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 1]);

    return (
        <section className="relative pt-[5.75rem]" ref={productRef}>
            {/* Content */}
            <div className="relative mx-auto max-w-screen-xl px-6 pb-6 pt-12 text-center md:pb-14 md:pt-16">
                <div className="mx-auto max-w-3xl">
                    <BlurFade
                        delay={0.3}
                        className="pointer-events-none select-none"
                    >
                        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                            The {" "}
                            <AnimatedShinyText className="inline">
                                <span>Future of DeFAI</span>
                            </AnimatedShinyText>{" "}
                            on <span>NEAR</span>
                        </h1>

                        <p className="mt-4 text-lg font-semibold mb-8">
                            ✨ <span className="text-primary">Powered by Intelligent Agents</span>
                        </p>
                    </BlurFade>
                </div>
            </div>

            {/* Product Preview */}
            <div className="relative w-full">
                <BlurFade delay={0.6} className="mx-auto max-w-screen-2xl px-6">
                    <div className="relative">
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{
                                rotateX,
                                scale,
                                opacity,
                                transformPerspective: 1000,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 50,
                                damping: 20,
                                delay: 0.5,
                            }}
                            className="relative mx-auto w-full max-w-[1200px] will-change-transform"
                        >
                            {/* Reduced blur radius for glow effect */}
                            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 blur-xl" />

                            <div className="group relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
                                {/* Light mode image */}
                                <div className="relative dark:hidden">
                                    <Image
                                        src="/product.png"
                                        alt="Neur AI Interface"
                                        width={1200}
                                        height={675}
                                        className="w-full rounded-2xl"
                                        priority
                                        unoptimized
                                    />
                                </div>

                                {/* Add dark mode image if needed */}
                                <div className="relative hidden dark:block">
                                    <Image
                                        src="/product.png"
                                        alt="Neur AI Interface"
                                        width={1200}
                                        height={675}
                                        className="w-full rounded-2xl"
                                        priority
                                        unoptimized
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </BlurFade>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="w-full mt-14 py-8 relative z-10">
            <BlurFade
                delay={0.5}
                className="flex items-center justify-center gap-3 text-sm text-muted-foreground"
            >
                <p>© 2025 SWAN. All rights reserved.</p>
                <span>|</span>
                <p>Made with 🩷</p>
                <span>|</span>
                <Link
                    href="https://x.com/foamsh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center hover:opacity-80 transition-opacity"
                >
                    <XLogo weight="fill" className="h-4 w-4" />
                </Link>
            </BlurFade>
        </footer>
    );
};
