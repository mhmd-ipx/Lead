import { useState, useEffect } from 'react'
import { Dialog, Button, Checkbox, Radio, Tag, Progress } from '@/components/ui'
import { HiOutlineDownload, HiOutlineDocumentText, HiOutlineTable, HiOutlineCog } from 'react-icons/hi'
import type { ExportSettings } from '@/utils/exportUtils'
import { motion, AnimatePresence } from 'framer-motion'

interface ExportSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (settings: ExportSettings) => void
    title?: string
    isBulk?: boolean
}

const ExportSettingsModal = ({ isOpen, onClose, onConfirm, title = 'تنظیمات خروجی', isBulk = false }: ExportSettingsModalProps) => {
    const [settings, setSettings] = useState<ExportSettings>({
        format: 'docx',
        showQuestionText: true,
        showOptionText: true,
        optionLabelType: 'number',
        includeApplicantInfo: true,
        includeTimestamp: true,
    })

    const [isGenerating, setIsGenerating] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!isOpen) {
            setIsGenerating(false)
            setProgress(0)
        }
    }, [isOpen])

    const handleConfirm = () => {
        setIsGenerating(true)
        
        let currentProgress = 0
        const interval = setInterval(() => {
            currentProgress += Math.random() * 30
            if (currentProgress >= 100) {
                currentProgress = 100
                clearInterval(interval)
                setTimeout(() => {
                    onConfirm(settings)
                    onClose()
                }, 500)
            }
            setProgress(currentProgress)
        }, 400)
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={isGenerating ? () => {} : onClose}
            onRequestClose={isGenerating ? () => {} : onClose}
            contentClassName="p-0 overflow-hidden rounded-3xl border-none shadow-2xl"
            width={620}
        >
            <div className="bg-white dark:bg-gray-900 relative">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <HiOutlineCog className="text-2xl animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                            <p className="text-xs text-gray-400">سفارشی‌سازی محتوای فایل نهایی</p>
                        </div>
                    </div>
                    {isBulk && <Tag className="bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 text-xs px-3">خروجی گروهی (ZIP)</Tag>}
                </div>

                {/* Fixed Height Content Area - Slightly increased for larger text */}
                <div className="h-[420px] overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div 
                                key="generating"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center space-y-8"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-indigo-50 dark:border-indigo-900/30 flex items-center justify-center">
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-20 h-20 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent absolute"
                                        />
                                        <HiOutlineDownload className="text-4xl text-indigo-600 animate-bounce" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">در حال تولید خروجی...</h4>
                                    <p className="text-sm text-gray-400 max-w-xs mx-auto">فایل شما در حال پردازش و سازماندهی است.</p>
                                </div>
                                <div className="w-full max-w-[320px]">
                                    <Progress variant="solid" color="indigo-600" percent={Math.round(progress)} />
                                    <p className="text-xs text-gray-400 mt-3 font-mono tracking-tighter">{Math.round(progress)}% PROCESSING</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="settings"
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 p-8 flex flex-col gap-6 overflow-y-auto"
                            >
                                {/* Format Selection */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div 
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${settings.format === 'docx' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        onClick={() => setSettings({ ...settings, format: 'docx' })}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${settings.format === 'docx' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                <HiOutlineDocumentText />
                                            </div>
                                            <div>
                                                <p className="font-bold text-base text-gray-900 dark:text-white">قالب Word</p>
                                                <p className="text-xs text-gray-400">مناسب برای آرشیو و چاپ</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${settings.format === 'xlsx' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        onClick={() => setSettings({ ...settings, format: 'xlsx' })}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${settings.format === 'xlsx' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                <HiOutlineTable />
                                            </div>
                                            <div>
                                                <p className="font-bold text-base text-gray-900 dark:text-white">قالب Excel</p>
                                                <p className="text-xs text-gray-400">تجزیه و تحلیل داده‌ها</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Options Grid */}
                                <div className="grid grid-cols-2 gap-x-10 gap-y-6 bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 block">نمایش متن سوالات</span>
                                            <p className="text-xs text-gray-400">درج صورت کامل سوال</p>
                                        </div>
                                        <Checkbox checked={settings.showQuestionText} onChange={(v) => setSettings({ ...settings, showQuestionText: v })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 block">نمایش متن گزینه‌ها</span>
                                            <p className="text-xs text-gray-400">درج محتوای گزینه انتخابی</p>
                                        </div>
                                        <Checkbox checked={settings.showOptionText} onChange={(v) => setSettings({ ...settings, showOptionText: v })} />
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 block">اطلاعات متقاضی</span>
                                            <p className="text-xs text-gray-400">نام و مشخصات شرکت</p>
                                        </div>
                                        <Checkbox checked={settings.includeApplicantInfo} onChange={(v) => setSettings({ ...settings, includeApplicantInfo: v })} />
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 block">تاریخ و زمان</span>
                                            <p className="text-xs text-gray-400">زمان دقیق اتمام آزمون</p>
                                        </div>
                                        <Checkbox checked={settings.includeTimestamp} onChange={(v) => setSettings({ ...settings, includeTimestamp: v })} />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">نحوه نمایش لیبل گزینه‌ها (مثلاً ۱ یا A)</p>
                                    <Radio.Group 
                                        value={settings.optionLabelType} 
                                        onChange={(val) => setSettings({ ...settings, optionLabelType: val as any })}
                                        className="flex gap-10"
                                    >
                                        <Radio value="number"><span className="text-sm font-bold">عددی (۱، ۲)</span></Radio>
                                        <Radio value="alpha"><span className="text-sm font-bold">حروف (A, B)</span></Radio>
                                        <Radio value="none"><span className="text-sm font-bold">بدون لیبل</span></Radio>
                                    </Radio.Group>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 rounded-b-3xl">
                    <Button 
                        variant="plain" 
                        onClick={onClose}
                        disabled={isGenerating}
                        className="rounded-xl px-6 text-sm font-bold"
                    >
                        انصراف
                    </Button>
                    <Button 
                        variant="solid" 
                        icon={!isGenerating && <HiOutlineDownload />} 
                        onClick={handleConfirm}
                        loading={isGenerating}
                        className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none text-sm font-bold"
                    >
                        {isGenerating ? 'در حال پردازش...' : 'شروع دانلود'}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default ExportSettingsModal
