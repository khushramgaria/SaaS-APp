import React, { useEffect } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Type,
} from "lucide-react";

// Extension customizing Enter and Shift+Enter behavior for independent block management
const CustomLineBreak = Extension.create({
  name: "customLineBreak",
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive("heading")) {
          const parent = editor.state.selection.$from.parent;
          if (parent.textContent === "") {
            return editor.chain().setParagraph().unsetAllMarks().run();
          }
          const level = editor.getAttributes("heading").level || 1;
          return editor.chain().splitBlock().unsetAllMarks().setHeading({ level }).run();
        }
        return false;
      },
      "Shift-Enter": ({ editor }) => {
        if (editor.isActive("heading")) {
          const parent = editor.state.selection.$from.parent;
          if (parent.textContent === "") {
            return editor.chain().setParagraph().unsetAllMarks().run();
          }
          const level = editor.getAttributes("heading").level || 1;
          return editor.chain().splitBlock().unsetAllMarks().setHeading({ level }).run();
        }
        if (editor.isActive("listItem")) {
          return editor.commands.splitListItem("listItem");
        }
        return editor.chain().splitBlock().unsetAllMarks().run();
      },
    };
  },
});

const RichTextEditor = ({
  content = "",
  onChange,
  readOnly = false,
  placeholder = "Start writing your document content...",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: false,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: false,
          keepAttributes: false,
        },
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CustomLineBreak,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Sync content when external content changes
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Sync readOnly prop
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  if (!editor) {
    return null;
  }

  const isParagraphActive =
    editor.isActive("paragraph") &&
    !editor.isActive("heading") &&
    !editor.isActive("bulletList") &&
    !editor.isActive("orderedList") &&
    !editor.isActive("blockquote") &&
    !editor.isActive("codeBlock");

  return (
    <div className="w-full flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-900 border-b border-slate-800/80 sticky top-0 z-20">
          {/* Normal Text / Paragraph */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().unsetAllMarks().run()}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              isParagraphActive
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Normal Text (Paragraph)"
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">Normal</span>
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 1 })
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 2 })
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 3 })
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              editor.isActive("bold")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              editor.isActive("italic")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              editor.isActive("strike")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              editor.isActive("code") || editor.isActive("codeBlock")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Lists & Blockquote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              editor.isActive("bulletList")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              editor.isActive("orderedList")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              editor.isActive("blockquote")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="p-6 min-h-[400px] cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent
          editor={editor}
          className="prose-editor max-w-4xl mx-auto text-slate-200 focus:outline-none leading-relaxed [&_.is-editor-empty:before]:text-slate-500 [&_.is-editor-empty:before]:float-left [&_.is-editor-empty:before]:content-[attr(data-placeholder)] [&_.is-editor-empty:before]:pointer-events-none"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
