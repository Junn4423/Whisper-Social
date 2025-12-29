'use client';

import React, { useState } from 'react';
import { X, Flag, AlertTriangle, ShieldAlert, ImageOff, MessageSquareWarning, Ban, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { reportConfession } from '@/actions/confessionActions';
import { t } from '@/lib/translations';
import { useApp } from '@/context/SupabaseAppContext';

export type ReportReason =
    | 'OFFENSIVE_CONTENT'
    | 'SCAM'
    | 'EXPLICIT_IMAGE'
    | 'HARASSMENT'
    | 'SPAM'
    | 'OTHER';

interface ReportOption {
    id: ReportReason;
    label: { vi: string; en: string };
    icon: React.ReactNode;
    color: string;
}

const reportOptions: ReportOption[] = [
    {
        id: 'OFFENSIVE_CONTENT',
        label: { vi: 'Nội dung thô tục', en: 'Offensive content' },
        icon: <Ban className="w-5 h-5" />,
        color: 'text-red-400',
    },
    {
        id: 'SCAM',
        label: { vi: 'Lừa đảo', en: 'Scam' },
        icon: <ShieldAlert className="w-5 h-5" />,
        color: 'text-orange-400',
    },
    {
        id: 'EXPLICIT_IMAGE',
        label: { vi: 'Ảnh nhạy cảm không che', en: 'Explicit uncensored image' },
        icon: <ImageOff className="w-5 h-5" />,
        color: 'text-pink-400',
    },
    {
        id: 'HARASSMENT',
        label: { vi: 'Quấy rối', en: 'Harassment' },
        icon: <MessageSquareWarning className="w-5 h-5" />,
        color: 'text-yellow-400',
    },
    {
        id: 'SPAM',
        label: { vi: 'Spam', en: 'Spam' },
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'text-blue-400',
    },
    {
        id: 'OTHER',
        label: { vi: 'Khác', en: 'Other' },
        icon: <HelpCircle className="w-5 h-5" />,
        color: 'text-gray-400',
    },
];

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    confessionId: string;
    onReportSuccess: () => void; // Callback to hide confession from view
}

export function ReportModal({ isOpen, onClose, confessionId, onReportSuccess }: ReportModalProps) {
    const { language, user } = useApp();
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.error(
                language === 'vi' ? 'Vui lòng chọn lý do báo cáo' : 'Please select a reason'
            );
            return;
        }

        if (!user) {
            toast.error(
                language === 'vi' ? 'Bạn cần đăng nhập để báo cáo' : 'Please login to report'
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await reportConfession({
                confessionId,
                reason: selectedReason,
                description: description.trim() || undefined,
            });

            if (result.success) {
                toast.success(
                    language === 'vi'
                        ? '✅ Báo cáo đã được gửi. Bài viết sẽ bị ẩn khỏi feed của bạn.'
                        : '✅ Report submitted. The post has been hidden from your feed.'
                );
                onReportSuccess();
                onClose();
            } else {
                toast.error(result.error || 'Failed to submit report');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error(
                language === 'vi' ? 'Có lỗi xảy ra, vui lòng thử lại' : 'Something went wrong, please try again'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-dark-100 rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
                {/* Glow Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-500/20 blur-3xl" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-dark-200/50 hover:bg-dark-200 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Header */}
                <div className="relative p-6 pb-4 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                        <Flag className="w-7 h-7 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                        {language === 'vi' ? 'Báo cáo vi phạm' : 'Report Violation'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {language === 'vi'
                            ? 'Chọn lý do bạn muốn báo cáo bài viết này'
                            : 'Select why you want to report this post'}
                    </p>
                </div>

                {/* Report Options */}
                <div className="px-6 space-y-2">
                    {reportOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedReason(option.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${selectedReason === option.id
                                    ? 'bg-red-500/10 border-red-500/50 shadow-lg'
                                    : 'bg-dark-200/30 border-dark-200 hover:border-red-500/30 hover:bg-dark-200/50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg bg-dark-200/50 ${option.color}`}>
                                {option.icon}
                            </div>
                            <span className={`font-medium ${selectedReason === option.id ? 'text-white' : 'text-gray-300'}`}>
                                {option.label[language]}
                            </span>
                            {selectedReason === option.id && (
                                <div className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Additional Description (for "Other") */}
                {selectedReason === 'OTHER' && (
                    <div className="px-6 mt-4">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={language === 'vi' ? 'Mô tả chi tiết...' : 'Describe in detail...'}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-dark-200 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-white placeholder-gray-500 resize-none transition-all"
                            maxLength={500}
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 pt-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-400 bg-dark-200/50 hover:bg-dark-200 transition-colors"
                    >
                        {t('cancel', language)}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedReason || isSubmitting}
                        className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{language === 'vi' ? 'Đang gửi...' : 'Submitting...'}</span>
                            </>
                        ) : (
                            <>
                                <Flag className="w-4 h-4" />
                                <span>{language === 'vi' ? 'Gửi báo cáo' : 'Submit Report'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReportModal;
