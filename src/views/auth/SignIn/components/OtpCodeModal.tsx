import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { HiOutlineClipboardCopy, HiCheckCircle } from 'react-icons/hi'

interface OtpCodeModalProps {
    isOpen: boolean
    onClose: () => void
    code: string
    expiresAt: string
}

const OtpCodeModal = ({ isOpen, onClose, code, expiresAt }: OtpCodeModalProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} width={400}>
            <div className="text-center p-4">
                <h5 className="mb-4">کد تایید OTP</h5>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        کد تایید شما:
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <p className="text-3xl font-bold tracking-widest text-primary">
                            {code}
                        </p>
                        <Button
                            size="sm"
                            variant="plain"
                            icon={copied ? <HiCheckCircle /> : <HiOutlineClipboardCopy />}
                            onClick={handleCopy}
                            className={copied ? 'text-green-500' : ''}
                        >
                            {copied ? 'کپی شد!' : 'کپی'}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        اعتبار تا: {new Date(expiresAt).toLocaleTimeString('fa-IR')}
                    </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ این کد فقط در حالت توسعه نمایش داده می‌شود
                    </p>
                </div>
                <Button block variant="solid" onClick={onClose}>
                    بستن
                </Button>
            </div>
        </Dialog>
    )
}

export default OtpCodeModal
