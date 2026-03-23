import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AdminProvidersPage: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [isApiKeySet, setIsApiKeySet] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await apiService.getSetting('GeminiApiKey');
            setIsApiKeySet(data.isSet);
            setApiKey(''); // Always keep the input empty
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to load current settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!apiKey) {
            setStatus({ type: 'error', message: 'Please enter a valid API key.' });
            return;
        }

        try {
            setSaving(true);
            await apiService.updateSetting('GeminiApiKey', apiKey);
            setStatus({ type: 'success', message: 'API key updated successfully. Changes take effect immediately.' });
            await loadSettings();
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Failed to update API key.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">AI Providers</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Configure API keys for external AI models.</p>
            </div>

            {status && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={20} /> : <AlertCircle className="shrink-0 mt-0.5" size={20} />}
                    <p className="text-sm font-medium">{status.message}</p>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                        <Key size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Google Gemini</h2>
                            {isApiKeySet ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">Configured</span>
                            ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-lg">Not Set</span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Default provider (gemini-3-flash-preview)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {isApiKeySet ? 'Update API Key' : 'Enter API Key'}
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={isApiKeySet ? "Enter a new key to update..." : "Enter your Gemini API key (AIzaSy...)"}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-800 dark:text-slate-100 font-mono text-sm placeholder:font-sans"
                            disabled={loading || saving}
                        />
                        <p className="text-xs text-slate-500 mt-2">Get your API key from Google AI Studio. Keep this secure.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading || saving || !apiKey}
                            className="flex items-center gap-2 px-6 py-2.5 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-sm"
                        >
                            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : isApiKeySet ? 'Update Key' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
