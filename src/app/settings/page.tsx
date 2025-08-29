'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useModal } from '@/hooks/useModal';

interface ApiKey {
	id: string;
	provider: string;
	keyName: string;
	createdAt: string;
	updatedAt: string;
}

export default function SettingsPage() {
	console.log('🔧 Settings page rendered');
	const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
	const [openaiKey, setOpenaiKey] = useState('');
	const [saving, setSaving] = useState(false);
	const [validating, setValidating] = useState(false);
	const [message, setMessage] = useState('');
	const [aiConfigOpen, setAiConfigOpen] = useState<boolean>(true);
	const [confirmMessage, setConfirmMessage] = useState('');
	const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
	const confirmModal = useModal();

	// Load existing API keys
	useEffect(() => {
		fetchApiKeys();
	}, []);

	const fetchApiKeys = async () => {
		try {
			const response = await fetch('/api/user/api-keys');
			if (response.ok) {
				const data = await response.json();
				setApiKeys(data.apiKeys || []);
			}
		} catch (error) {
			console.error('Error fetching API keys:', error);
		}
	};

	const proceedWithSaving = async () => {
		setSaving(true);
		setMessage('💾 Saving API key...');

		try {
			const saveResponse = await fetch('/api/user/api-keys', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					provider: 'openai',
					keyName: 'OpenAI API Key',
					apiKey: openaiKey,
				}),
			});

			const saveData = await saveResponse.json();

			if (saveResponse.ok) {
				setMessage('✅ OpenAI API key validated and saved successfully!');
				setOpenaiKey('');
				fetchApiKeys(); // Refresh the list
			} else {
				// Use user-friendly message from API if available
				const errorMessage = saveData.userMessage || saveData.error || 'Error saving API key';
				setMessage(errorMessage);
			}
		} catch (error) {
			console.error('Error saving API key:', error);
			setMessage('Network error. Please check your connection and try again.');
		} finally {
			setSaving(false);
		}
	};

	const validateAndSaveOpenAIKey = async () => {
		if (!openaiKey.trim()) {
			setMessage('Please enter an API key');
			return;
		}

		// Step 1: Validate the API key
		setValidating(true);
		setMessage('🔍 Validating API key...');

		try {
			const validateResponse = await fetch('/api/user/api-keys/validate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					provider: 'openai',
					apiKey: openaiKey,
				}),
			});

			const validateData = await validateResponse.json();

			// If validation failed, show error and stop
			if (!validateResponse.ok || validateData.valid === false) {
				setMessage(validateData.userMessage || 'API key validation failed');
				setValidating(false);
				return;
			}

			// If validation was inconclusive (network issues), ask user if they want to proceed
			if (validateData.valid === null) {
				setConfirmMessage(`${validateData.userMessage}\n\nWould you like to save the key anyway?`);
				setConfirmAction(() => proceedWithSaving);
				confirmModal.open();
				setValidating(false);
				return;
			}

			// Proceed with saving if validation passed
			setValidating(false);
			await proceedWithSaving();
		} catch (error) {
			console.error('Error validating API key:', error);
			setMessage('Network error. Please check your connection and try again.');
			setValidating(false);
		}
	};

	const deleteApiKey = async (provider: string) => {
		try {
			const response = await fetch(`/api/user/api-keys?provider=${provider}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				setMessage('API key deleted successfully');
				fetchApiKeys(); // Refresh the list
			} else {
				setMessage('Error deleting API key');
			}
		} catch (error) {
			console.error('Error deleting API key:', error);
			setMessage('Error deleting API key');
		}
	};

	const hasOpenAIKey = apiKeys.some(key => key.provider === 'openai');

	return (
		<div className="min-h-screen p-6 bg-[color:var(--color-background)]">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div>
					<h1 className="flex items-center gap-3 text-2xl font-bold text-[color:var(--color-foreground)] mb-2">
						<div className="w-8 h-8 bg-[color:var(--color-warning)] rounded-[var(--radius)] flex items-center justify-center">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
								<circle cx="12" cy="12" r="3"/>
							</svg>
						</div>
						Settings
					</h1>
					<p className="text-[color:var(--color-muted-foreground)]">
						Manage your account settings and API configurations
					</p>
				</div>

				{/* AI Model Configuration */}
				<Card variant="elevated">
					<CardHeader 
						className="cursor-pointer hover:bg-[color:var(--color-surface)]/50 transition-colors duration-200" 
						onClick={() => setAiConfigOpen(!aiConfigOpen)}
					>
						<CardTitle className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
									<circle cx="12" cy="12" r="3"/>
								</svg>
								AI Model Configuration
							</div>
							<svg 
								width="16" 
								height="16" 
								viewBox="0 0 24 24" 
								fill="none" 
								stroke="currentColor" 
								strokeWidth="2" 
								strokeLinecap="round" 
								strokeLinejoin="round"
								className={`transition-transform duration-200 ${aiConfigOpen ? 'rotate-180' : ''}`}
							>
								<path d="m6 9 6 6 6-6"/>
							</svg>
						</CardTitle>
					</CardHeader>
					{aiConfigOpen && (
						<CardContent>
						<p className="text-sm text-[color:var(--color-muted-foreground)] mb-6">
							Configure API keys for AI models used in prompt testing. Keys are encrypted and stored securely.
						</p>
						<div className="space-y-4">
							{/* OpenAI API Key Section */}
							<Card variant="outlined">
								<CardContent className="p-4">
									<div className="flex items-center justify-between mb-4">
										<div>
											<h3 className="text-md font-medium text-[color:var(--color-foreground)]">OpenAI API Key</h3>
											<p className="text-xs text-[color:var(--color-muted-foreground)]">
												Required for GPT models (GPT-4, GPT-3.5, etc.)
											</p>
										</div>
										{hasOpenAIKey && (
											<span className="px-2 py-1 text-xs bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] rounded-full border border-[color:var(--color-success)]/20">
												Configured
											</span>
										)}
									</div>
							
									{hasOpenAIKey ? (
										<div className="flex items-center justify-between">
											<span className="text-sm text-[color:var(--color-muted-foreground)]">
												API key is configured and encrypted
											</span>
											<Button
												variant="danger"
												size="sm"
												onClick={() => deleteApiKey('openai')}
											>
												Remove
											</Button>
										</div>
									) : (
										<div className="space-y-3">
											<Input
												type="password"
												value={openaiKey}
												onChange={(e) => setOpenaiKey(e.target.value)}
												placeholder="sk-..."
												label=""
											/>
											<Button
												variant="primary"
												onClick={validateAndSaveOpenAIKey}
												disabled={saving || validating}
												loading={saving || validating}
											>
												{validating ? 'Validating...' : saving ? 'Saving...' : 'Validate & Save API Key'}
											</Button>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Future AI providers - Anthropic */}
							<Card variant="outlined" className="opacity-50">
								<CardContent className="p-4">
									<div className="flex items-center justify-between mb-3">
										<div>
											<h3 className="text-md font-medium text-[color:var(--color-foreground)]">Anthropic API Key</h3>
											<p className="text-xs text-[color:var(--color-muted-foreground)]">
												For Claude models (coming soon)
											</p>
										</div>
										<span className="px-2 py-1 text-xs bg-[color:var(--color-surface-2)] text-[color:var(--color-muted-foreground)] rounded-full">
											Coming Soon
										</span>
									</div>
								</CardContent>
							</Card>

							{/* Status Messages */}
							{message && (
								<div className={`p-3 rounded-[var(--radius)] text-sm ${
									message.includes('✅') || message.includes('successfully')
										? 'bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] border border-[color:var(--color-success)]/20'
										: message.includes('🔍 Validating') || message.includes('💾 Saving')
										? 'bg-[color:var(--color-surface)]/50 text-[color:var(--color-foreground)] border border-[color:var(--color-border)]'
										: 'bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)] border border-[color:var(--color-danger)]/20'
								}`}>
									{message}
								</div>
							)}
						</div>
						</CardContent>
					)}
				</Card>
			</div>

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={confirmModal.isOpen}
				onClose={() => {
					confirmModal.close();
					setConfirmAction(null);
					setConfirmMessage('');
				}}
				onConfirm={() => {
					confirmModal.close();
					if (confirmAction) {
						confirmAction();
					}
					setConfirmAction(null);
					setConfirmMessage('');
				}}
				title="API Key Validation"
				message={confirmMessage}
				confirmText="Save Anyway"
				confirmVariant="primary"
				cancelText="Cancel"
			/>
		</div>
	);
}