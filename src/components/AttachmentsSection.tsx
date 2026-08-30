import React, { useState, useEffect, useRef } from 'react';
import { Camera, ImagePlus, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Attachment, getAttachments, addAttachment, removeAttachment } from '../utils/attachments';

interface Props {
  reportId: string;
  isClosed: boolean;
  onHasAttachmentsChange?: (has: boolean) => void;
}

export function AttachmentsSection({ reportId, isClosed, onHasAttachmentsChange }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, [reportId]);

  const loadAttachments = async () => {
    setIsLoading(true);
    const data = await getAttachments(reportId);
    setAttachments(data);
    setIsLoading(false);
    if (onHasAttachmentsChange && data.length > 0) {
      onHasAttachmentsChange(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newAttachment: Attachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            dataUrl,
            timestamp: new Date().toISOString()
          };
          
          await addAttachment(reportId, newAttachment);
          // Only trigger state update/reload for the last file or just append
          setAttachments(prev => [...prev, newAttachment]);
          if (onHasAttachmentsChange) onHasAttachmentsChange(true);
        }
      };
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (attachmentId: string) => {
    const confirmDelete = window.confirm('هل أنت متأكد من حذف هذه الصورة؟');
    if (!confirmDelete) return;

    await removeAttachment(reportId, attachmentId);
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    
    if (attachments.length === 1 && onHasAttachmentsChange) {
      onHasAttachmentsChange(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-4">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">أرشيف صور الورق الأصلي</h2>
        </div>
        {!isClosed && (
          <div>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              capture="environment"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ImagePlus className="w-4 h-4" />
              <span>إضافة صور</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-sm">جاري تحميل الصور...</span>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">لم يتم رفع أي صور لهذا التقرير بعد.</p>
            {!isClosed && <p className="text-xs text-slate-400 mt-1">يمكنك تصوير تقارير الورق الأصلية ورفعها هنا للرجوع إليها مستقبلاً.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {attachments.map(att => (
              <div key={att.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/4]">
                <img 
                  src={att.dataUrl} 
                  alt="Report document" 
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(att.dataUrl)}
                />
                {!isClosed && (
                  <button
                    onClick={() => handleRemove(att.id)}
                    className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف الصورة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-[10px] font-mono truncate">
                  {new Date(att.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox for zooming in */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking image
          />
        </div>
      )}
    </div>
  );
}
