import React, { useState } from 'react';
import { DailyReport } from '../types';
import { generateWhatsAppMessage, getWhatsAppUrl } from '../utils/whatsappFormatter';
import { X, Send, Copy, Check, MessageSquare, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyReport;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, report }) => {
  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const messageText = generateWhatsAppMessage(report);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSendWhatsApp = () => {
    const url = getWhatsAppUrl(report, phoneNumber);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">إرسال التقرير لمجموعة الإدارة</h3>
              <p className="text-xs text-slate-500">إرسال الملخص اليومي عبر واتساب أو نسخه للمحادثة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رقم هاتف مستلم محدد (اختياري - اتركه فارغاً للإرسال للمجموعة مباشرة):
            </label>
            <input
              type="text"
              placeholder="مثال: 9627XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              معاينة الرسالة اليومية المنظمة:
            </label>
            <div className="relative">
              <pre
                className="w-full h-64 p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed overflow-y-auto whitespace-pre-wrap select-all border border-slate-800"
                dir="rtl"
              >
                {messageText}
              </pre>
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-3 left-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ النص</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ بنجاح' : 'نسخ للحافظة'}</span>
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>إرسال عبر WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
