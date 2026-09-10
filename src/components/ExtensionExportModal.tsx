import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Code,
  Layers,
  Chrome,
  HelpCircle,
} from 'lucide-react';

interface ExtensionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionExportModal: React.FC<ExtensionExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const manifestJsonContent = `{
  "manifest_version": 3,
  "name": "Material You New Tab",
  "version": "1.0.0",
  "description": "Material You customizable new tab dashboard featuring dynamic colors, clock, weather, quick access shortcuts, and AI tools.",
  "action": {
    "default_title": "Material You New Tab"
  },
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": [
    "storage"
  ]
}`;

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestJsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([manifestJsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--md-sys-color-surface-container-high)] rounded-3xl p-6 shadow-2xl border border-[var(--md-sys-color-outline)] animate-in zoom-in-95 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline)]/40 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-on-primary-container)]">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                Browser Extension Guide
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Install as your Chrome, Edge, or Brave New Tab
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-xs sm:text-sm text-[var(--md-sys-color-on-surface)]">
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            You can load this application directly into your web browser as a permanent New Tab override extension:
          </p>

          <ol className="space-y-2.5 list-decimal list-inside bg-[var(--md-sys-color-surface)] p-3.5 rounded-2xl border border-[var(--md-sys-color-outline)]/40 font-medium">
            <li>
              <span>Build the project files via </span>
              <code className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container)] font-mono text-[var(--md-sys-color-primary)] font-bold">
                npm run build
              </code>
              <span> to generate the production </span>
              <code className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container)] font-mono text-[var(--md-sys-color-primary)]">
                dist/
              </code>
              <span> directory.</span>
            </li>
            <li>
              <span>Place </span>
              <code className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container)] font-mono text-[var(--md-sys-color-primary)]">
                manifest.json
              </code>
              <span> into the built folder.</span>
            </li>
            <li>
              <span>Open </span>
              <code className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container)] font-mono text-[var(--md-sys-color-primary)]">
                chrome://extensions
              </code>
              <span> (or edge://extensions) in your browser.</span>
            </li>
            <li>
              <span>Toggle </span>
              <strong>Developer mode</strong>
              <span> on the top-right corner.</span>
            </li>
            <li>
              <span>Click </span>
              <strong>Load unpacked</strong>
              <span> and select the folder. Enjoy your Material You New Tab!</span>
            </li>
          </ol>

          {/* Manifest.json snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                <Code className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                manifest.json (Manifest V3)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyManifest}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-hover-tint)] text-xs font-semibold cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadManifest}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-2xl bg-zinc-900 text-zinc-200 text-[11px] font-mono overflow-x-auto max-h-36 custom-scrollbar border border-zinc-700">
              {manifestJsonContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[var(--md-sys-color-outline)]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
