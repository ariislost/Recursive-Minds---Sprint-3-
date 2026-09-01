import React, { useState } from 'react';
import { Item, AppUser } from '../types';
import { calculateExpiryDate, generateClaimEmail } from '../utils/ocrExtraction';
import { X, Copy, Check, Mail, Sparkles } from 'lucide-react';

interface ClaimModalProps {
  item: Item;
  currentUser: AppUser | null;
  onClose: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ item, currentUser, onClose }) => {
  const expiryDate = calculateExpiryDate(item.purchase_date, item.warranty_months);
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Customer';

  const defaultEmail = generateClaimEmail(
    item.product,
    item.brand,
    item.purchase_date,
    expiryDate,
    userName
  );

  const [emailText, setEmailText] = useState(defaultEmail.fullEmail);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleOpenMailto = () => {
    const subjectMatch = emailText.match(/^Subject:\s*(.*)/m);
    const subject = subjectMatch ? subjectMatch[1] : `Warranty Claim - ${item.product}`;
    const bodyOnly = emailText.replace(/^Subject:.*\n*/m, '').trim();
    const mailtoUrl = `mailto:support@${(item.brand || 'brand').toLowerCase().replace(/\s+/g, '')}.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyOnly)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081018]/80 backdrop-blur-md">
      <div 
        className="w-full max-w-lg glass-panel text-white rounded-[28px] border border-white/20 p-6 sm:p-7 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl space-y-4"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                Warranty Claim Dispatcher
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {item.product}
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Brand: {item.brand} • Valid until: {expiryDate}
            </p>
          </div>
          <button
            id="close-claim-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-1 flex-1 overflow-y-auto space-y-3">
          <div className="glass-panel-subtle p-3.5 rounded-[16px] border border-white/10 text-xs text-white/80 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
            <span>
              Pre-filled warranty claim template using your receipt metadata. You can edit this text directly before copying.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
              Draft Claim Email
            </label>
            <textarea
              id="claim-email-textarea"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={8}
              className="w-full glass-input rounded-[16px] p-3.5 text-xs sm:text-sm font-mono leading-relaxed resize-none"
              placeholder="Edit claim message..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <button
            id="copy-claim-email-btn"
            onClick={handleCopy}
            className="flex-1 py-3.5 px-4 rounded-full bg-white hover:bg-white/90 text-[#081018] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-99 transition-all cursor-pointer shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#081018] stroke-[2.5]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#081018]" />
                <span>Copy Email</span>
              </>
            )}
          </button>

          <button
            id="open-mail-app-btn"
            onClick={handleOpenMailto}
            className="py-3.5 px-5 rounded-full bg-white/10 text-white border border-white/15 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/20 active:scale-99 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Open Mail App</span>
          </button>
        </div>
      </div>
    </div>
  );
};

