'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import AppIcon from "@/components/AppIcon";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setPending(true);
		setError(null);
		try {
			const res = await authClient.signIn.email({
				email,
				password,
			});
			if (res?.error) {
				setError(res.error.message ?? "Failed to sign in");
			} else {
				router.push("/");
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unexpected error";
			setError(message);
		} finally {
			setPending(false);
		}
	};

	return (
		<div className="min-h-screen bg-[color:var(--color-background)] flex items-center justify-center p-6">
			<div className="w-full max-w-md space-y-6">
				{/* Logo and branding */}
				<div className="text-center">
					<div className="flex justify-center mb-4">
						<AppIcon size={48} />
					</div>
					<h1 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">
						Welcome Back
					</h1>
					<p className="text-[color:var(--color-muted-foreground)]">
						Sign in to your Prompt Autotester account
					</p>
				</div>

				{/* Sign in form */}
				<Card variant="elevated">
					<CardContent>
						<form onSubmit={onSubmit} className="space-y-4">
							<Input
								type="email"
								label="Email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								error={error && error.toLowerCase().includes('email') ? error : undefined}
								leftIcon={
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
										<polyline points="22,6 12,13 2,6"/>
									</svg>
								}
								required
							/>
							
							<Input
								type="password"
								label="Password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								error={error && error.toLowerCase().includes('password') ? error : undefined}
								leftIcon={
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
										<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
									</svg>
								}
								required
							/>

							{error && !error.toLowerCase().includes('email') && !error.toLowerCase().includes('password') && (
								<div className="p-3 bg-[color:var(--color-danger-light)]/10 border border-[color:var(--color-danger)] rounded-[var(--radius)] flex items-center gap-2">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-danger)] flex-shrink-0">
										<circle cx="12" cy="12" r="10"/>
										<line x1="15" y1="9" x2="9" y2="15"/>
										<line x1="9" y1="9" x2="15" y2="15"/>
									</svg>
									<span className="text-sm text-[color:var(--color-danger)]">{error}</span>
								</div>
							)}

							<Button 
								type="submit" 
								loading={pending}
								disabled={!email || !password}
								className="w-full"
								size="lg"
							>
								{pending ? "Signing in..." : "Sign In"}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-[color:var(--color-muted-foreground)]">
								Don&apos;t have an account?{" "}
								<Link 
									href="/signup" 
									className="font-medium text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)] transition-colors"
								>
									Sign up
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="text-center text-xs text-[color:var(--color-muted-foreground)]">
					<p>© 2024 Prompt Autotester. AI Testing Suite.</p>
				</div>
			</div>
		</div>
	);
}


