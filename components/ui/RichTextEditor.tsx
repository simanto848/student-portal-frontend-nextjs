"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { common, createLowlight } from "lowlight";
import { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Code,
    Table as TableIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Quote,
    Minus,
    Loader2,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from "lucide-react";
import { useState } from "react";

// Initialize lowlight with common languages
const lowlight = createLowlight(common);

interface RichTextEditorProps {
    content?: object | string;
    onChange?: (content: object) => void;
    onImageUpload?: (file: File) => Promise<string>;
    placeholder?: string;
    className?: string;
    editable?: boolean;
}

// Toolbar Button Component
const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
}) => (
    <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
            "h-8 w-8 p-0",
            isActive && "bg-[#588157]/20 text-[#588157]"
        )}
    >
        {children}
    </Button>
);

// Toolbar Divider
const ToolbarDivider = () => (
    <div className="w-px h-6 bg-border mx-1" />
);

export function RichTextEditor({
    content,
    onChange,
    onImageUpload,
    placeholder = "Start typing...",
    className,
    editable = true,
}: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,  // Prevents SSR hydration mismatch in Next.js
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We use CodeBlockLowlight instead
            }),
            Underline,
            Image.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto my-4 cursor-pointer",
                },
            }).extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        width: {
                            default: null,
                            renderHTML: attributes => {
                                if (!attributes.width) return {};
                                return { width: attributes.width };
                            },
                            parseHTML: element => element.getAttribute('width'),
                        },
                        height: {
                            default: null,
                            renderHTML: attributes => {
                                if (!attributes.height) return {};
                                return { height: attributes.height };
                            },
                            parseHTML: element => element.getAttribute('height'),
                        },
                        float: {
                            default: null,
                            renderHTML: attributes => {
                                if (!attributes.float) return {};
                                const styles: Record<string, string> = {
                                    left: 'float: left; margin-right: 1rem; margin-bottom: 0.5rem;',
                                    right: 'float: right; margin-left: 1rem; margin-bottom: 0.5rem;',
                                    center: 'display: block; margin-left: auto; margin-right: auto;',
                                };
                                return {
                                    style: styles[attributes.float] || '',
                                    'data-float': attributes.float,
                                };
                            },
                            parseHTML: element => element.getAttribute('data-float'),
                        },
                    };
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: typeof content === "string" ? content : content || "",
        editable,
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getJSON());
            }
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4",
                    "prose-headings:text-[#344e41] prose-headings:font-semibold",
                    "prose-p:text-gray-700 prose-p:my-2",
                    "prose-strong:text-[#344e41]",
                    "prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
                    "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg",
                    "prose-blockquote:border-l-4 prose-blockquote:border-[#588157] prose-blockquote:pl-4 prose-blockquote:italic",
                    "prose-ul:list-disc prose-ol:list-decimal",
                    "prose-img:rounded-lg prose-img:shadow-md"
                ),
            },
        },
    });

    // Update content when prop changes
    useEffect(() => {
        if (editor && content) {
            const currentContent = editor.getJSON();
            const newContent = typeof content === "string" ? content : JSON.stringify(content);
            const currentString = JSON.stringify(currentContent);

            // Only update if content is different
            if (newContent !== currentString && typeof content === "object") {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    const handleImageUpload = useCallback(async () => {
        if (!onImageUpload) return;
        fileInputRef.current?.click();
    }, [onImageUpload]);

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file || !onImageUpload || !editor) return;

            try {
                setIsUploading(true);
                const url = await onImageUpload(file);
                editor.chain().focus().setImage({ src: url }).run();
            } catch (error) {
                console.error("Image upload failed:", error);
            } finally {
                setIsUploading(false);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        },
        [editor, onImageUpload]
    );

    const insertTable = useCallback(() => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    // Image resize function
    const setImageSize = useCallback((size: 'small' | 'medium' | 'large' | 'full') => {
        if (!editor) return;

        const dimensions = {
            small: { width: '200' },
            medium: { width: '400' },
            large: { width: '600' },
            full: { width: '100%' },
        };

        editor.chain().focus().updateAttributes('image', dimensions[size]).run();
    }, [editor]);

    // Image float/alignment function
    const setImageFloat = useCallback((float: 'left' | 'center' | 'right' | null) => {
        if (!editor) return;
        editor.chain().focus().updateAttributes('image', { float }).run();
    }, [editor]);

    if (!editor) {
        return (
            <div className="flex items-center justify-center h-32 border rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className={cn("border rounded-lg overflow-hidden bg-white", className)}>
            {/* Editor Styles for selected images */}
            <style jsx global>{`
                .ProseMirror img.ProseMirror-selectednode {
                    outline: 3px solid #588157;
                    outline-offset: 2px;
                }
                .ProseMirror img {
                    transition: outline 0.15s ease;
                }
            `}</style>
            {/* Toolbar */}
            {editable && (
                <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-gray-50">
                    {/* Text Formatting */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive("bold")}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive("italic")}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive("underline")}
                        title="Underline (Ctrl+U)"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Headings */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive("heading", { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive("heading", { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive("heading", { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Lists */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive("orderedList")}
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Block Elements */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive("blockquote")}
                        title="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive("codeBlock")}
                        title="Code Block"
                    >
                        <Code className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Horizontal Rule"
                    >
                        <Minus className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Table */}
                    <ToolbarButton
                        onClick={insertTable}
                        isActive={editor.isActive("table")}
                        title="Insert Table"
                    >
                        <TableIcon className="h-4 w-4" />
                    </ToolbarButton>

                    {/* Image Upload */}
                    {onImageUpload && (
                        <ToolbarButton
                            onClick={handleImageUpload}
                            disabled={isUploading}
                            title="Upload Image"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ImageIcon className="h-4 w-4" />
                            )}
                        </ToolbarButton>
                    )}

                    {/* Image Size Controls - shown when an image is selected */}
                    {editor.isActive("image") && (
                        <div className="flex items-center gap-1 ml-2 pl-2 border-l-2 border-[#588157] bg-[#588157]/5 rounded-r px-2 py-1">
                            <span className="text-xs font-medium text-[#344e41] mr-1">Resize:</span>
                            <button
                                type="button"
                                onClick={() => setImageSize('small')}
                                className="h-6 px-2 text-xs rounded bg-gray-100 hover:bg-[#588157] hover:text-white transition-colors font-medium border"
                                title="Small (200px)"
                            >
                                Small
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageSize('medium')}
                                className="h-6 px-2 text-xs rounded bg-gray-100 hover:bg-[#588157] hover:text-white transition-colors font-medium border"
                                title="Medium (400px)"
                            >
                                Medium
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageSize('large')}
                                className="h-6 px-2 text-xs rounded bg-gray-100 hover:bg-[#588157] hover:text-white transition-colors font-medium border"
                                title="Large (600px)"
                            >
                                Large
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageSize('full')}
                                className="h-6 px-2 text-xs rounded bg-[#588157] text-white hover:bg-[#3a5a40] transition-colors font-medium"
                                title="Full Width (100%)"
                            >
                                Full
                            </button>

                            {/* Alignment/Float Controls */}
                            <div className="w-px h-5 bg-gray-300 mx-2" />
                            <span className="text-xs font-medium text-[#344e41] mr-1">Align:</span>
                            <button
                                type="button"
                                onClick={() => setImageFloat('left')}
                                className="h-6 w-6 flex items-center justify-center rounded bg-gray-100 hover:bg-[#588157] hover:text-white transition-colors border"
                                title="Float Left (text wraps right)"
                            >
                                <AlignLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageFloat('center')}
                                className="h-6 w-6 flex items-center justify-center rounded bg-gray-100 hover:bg-[#588157] hover:text-white transition-colors border"
                                title="Center"
                            >
                                <AlignCenter className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageFloat('right')}
                                className="h-6 w-6 flex items-center justify-center rounded bg-gray-100 hover:bg-[#588157] hover:text-white transition-colors border"
                                title="Float Right (text wraps left)"
                            >
                                <AlignRight className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageFloat(null)}
                                className="h-6 px-2 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors font-medium border"
                                title="Remove float"
                            >
                                Reset
                            </button>
                        </div>
                    )}

                    <ToolbarDivider />

                    {/* Undo/Redo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>
                </div>
            )}

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}

// Read-only viewer component
export function RichTextViewer({
    content,
    className,
}: {
    content?: object | string;
    className?: string;
}) {
    return (
        <RichTextEditor
            content={content}
            editable={false}
            className={className}
        />
    );
}

export default RichTextEditor;
