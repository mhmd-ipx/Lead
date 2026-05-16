import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import {
    MdFormatBold,
    MdFormatItalic,
    MdFormatListBulleted,
    MdFormatListNumbered,
    MdFormatQuote,
    MdHorizontalRule,
    MdUndo,
    MdRedo,
    MdStrikethroughS,
    MdCode,
    MdFormatClear,
} from 'react-icons/md'

interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    readOnly?: boolean
    minHeight?: number
    placeholder?: string
}

const ToolbarButton = ({
    onClick,
    active,
    disabled,
    title,
    children,
}: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    title?: string
    children: React.ReactNode
}) => (
    <button
        type="button"
        title={title}
        onMouseDown={(e) => {
            e.preventDefault()
            onClick()
        }}
        disabled={disabled}
        className={[
            'p-1.5 rounded-md text-sm transition-all duration-150',
            active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
            disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
    >
        {children}
    </button>
)

const Divider = () => (
    <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
)

const RichTextEditor = ({
    value,
    onChange,
    readOnly = false,
    minHeight = 320,
    placeholder = 'متن را وارد کنید...',
}: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
                dir: 'rtl',
                style: `min-height: ${minHeight}px; padding: 1rem;`,
            },
        },
    })

    // Sync external value changes (e.g., when data loads from API)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', false)
        }
    }, [value])

    useEffect(() => {
        if (editor) {
            editor.setEditable(!readOnly)
        }
    }, [readOnly, editor])

    if (!editor) return null

    return (
        <div
            className={[
                'border rounded-xl overflow-hidden transition-colors',
                readOnly
                    ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus-within:border-indigo-400 dark:focus-within:border-indigo-600',
            ].join(' ')}
        >
            {/* Toolbar */}
            {!readOnly && (
                <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                    {/* History */}
                    <ToolbarButton
                        title="بازگشت (Ctrl+Z)"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <MdUndo size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="جلو (Ctrl+Y)"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <MdRedo size={18} />
                    </ToolbarButton>

                    <Divider />

                    {/* Headings */}
                    {([1, 2, 3] as const).map((level) => (
                        <ToolbarButton
                            key={level}
                            title={`تیتر ${level}`}
                            onClick={() =>
                                editor.chain().focus().toggleHeading({ level }).run()
                            }
                            active={editor.isActive('heading', { level })}
                        >
                            <span className="font-bold text-xs">H{level}</span>
                        </ToolbarButton>
                    ))}

                    <Divider />

                    {/* Text formatting */}
                    <ToolbarButton
                        title="ضخیم (Ctrl+B)"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive('bold')}
                    >
                        <MdFormatBold size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="ایتالیک (Ctrl+I)"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive('italic')}
                    >
                        <MdFormatItalic size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="خط‌خورده"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={editor.isActive('strike')}
                    >
                        <MdStrikethroughS size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="کد داخلی"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        active={editor.isActive('code')}
                    >
                        <MdCode size={18} />
                    </ToolbarButton>

                    <Divider />

                    {/* Lists */}
                    <ToolbarButton
                        title="لیست نقطه‌ای"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive('bulletList')}
                    >
                        <MdFormatListBulleted size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="لیست شماره‌دار"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive('orderedList')}
                    >
                        <MdFormatListNumbered size={18} />
                    </ToolbarButton>

                    <Divider />

                    {/* Block elements */}
                    <ToolbarButton
                        title="نقل‌قول"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive('blockquote')}
                    >
                        <MdFormatQuote size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="بلوک کد"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        active={editor.isActive('codeBlock')}
                    >
                        <MdCode size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="خط جداکننده"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    >
                        <MdHorizontalRule size={18} />
                    </ToolbarButton>

                    <Divider />

                    {/* Clear formatting */}
                    <ToolbarButton
                        title="پاک کردن قالب‌بندی"
                        onClick={() =>
                            editor.chain().focus().clearNodes().unsetAllMarks().run()
                        }
                    >
                        <MdFormatClear size={18} />
                    </ToolbarButton>
                </div>
            )}

            {/* Editor area */}
            <div className="relative">
                {editor.isEmpty && !readOnly && (
                    <div
                        className="absolute top-4 right-4 text-gray-400 dark:text-gray-600 pointer-events-none text-sm"
                        dir="rtl"
                    >
                        {placeholder}
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

export default RichTextEditor
