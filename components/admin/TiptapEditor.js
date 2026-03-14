"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle, FontSize as TiptapFontSize } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback, useEffect, useRef, useState } from "react";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const COLORS = [
  "#000000", "#434343", "#666666", "#999999",
  "#DC2626", "#EA580C", "#D97706", "#65A30D",
  "#059669", "#0891B2", "#2563EB", "#7C3AED",
  "#C026D3", "#E11D48",
];

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("width") || el.style.width || null,
        renderHTML: (attrs) => {
          if (!attrs.width) return {};
          return { width: attrs.width, style: `width: ${attrs.width}` };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement("div");
      container.style.display = "inline-block";
      container.style.position = "relative";
      container.style.lineHeight = "0";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      if (node.attrs.width) {
        img.style.width = node.attrs.width;
      } else {
        img.style.maxWidth = "100%";
      }
      img.style.display = "block";
      img.style.cursor = "default";

      const handle = document.createElement("div");
      Object.assign(handle.style, {
        position: "absolute",
        right: "-4px",
        bottom: "-4px",
        width: "12px",
        height: "12px",
        background: "#2563EB",
        borderRadius: "2px",
        cursor: "nwse-resize",
      });

      container.appendChild(img);
      container.appendChild(handle);

      let startX = 0;
      let startW = 0;

      function onMouseDown(e) {
        e.preventDefault();
        startX = e.clientX;
        startW = img.offsetWidth;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }

      function onMouseMove(e) {
        const w = Math.max(50, startW + (e.clientX - startX));
        img.style.width = w + "px";
      }

      function onMouseUp(e) {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        const pos = getPos();
        if (typeof pos === "number") {
          editor.chain().focus().setNodeSelection(pos).updateAttributes("image", {
            width: img.style.width,
          }).run();
        }
      }

      handle.addEventListener("mousedown", onMouseDown);

      return {
        dom: container,
        destroy() {
          handle.removeEventListener("mousedown", onMouseDown);
        },
        update(updatedNode) {
          if (updatedNode.type.name !== "image") return false;
          img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.width) img.style.width = updatedNode.attrs.width;
          return true;
        },
      };
    };
  },
});

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-sm transition-colors ${
        active
          ? "bg-slate-700 text-white"
          : "text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }) {
  const [showColors, setShowColors] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const colorRef = useRef(null);
  const fontRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (colorRef.current && !colorRef.current.contains(e.target)) setShowColors(false);
      if (fontRef.current && !fontRef.current.contains(e.target)) setShowFontSize(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addLink = useCallback(() => {
    const url = window.prompt("링크 URL을 입력하세요:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      editor.chain().focus().setImage({ src: data.url }).run();
    }
    e.target.value = "";
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="H1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="H2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="H3"
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        active={editor.isActive("heading", { level: 4 })}
        title="H4"
      >
        H4
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

      {/* Font size */}
      <div className="relative" ref={fontRef}>
        <button
          type="button"
          onClick={() => setShowFontSize(!showFontSize)}
          className="px-2 py-1 rounded text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600"
          title="글자 크기"
        >
          크기
        </button>
        {showFontSize && (
          <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-600 dark:bg-slate-700">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  editor.chain().focus().setFontSize(size).run();
                  setShowFontSize(false);
                }}
                className="block w-full rounded px-3 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-600"
              >
                {size}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetFontSize().run();
                setShowFontSize(false);
              }}
              className="block w-full rounded px-3 py-1 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              초기화
            </button>
          </div>
        )}
      </div>

      <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="굵게"
      >
        <b>B</b>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="기울임"
      >
        <i>I</i>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="밑줄"
      >
        <u>U</u>
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

      {/* Color picker */}
      <div className="relative" ref={colorRef}>
        <button
          type="button"
          onClick={() => setShowColors(!showColors)}
          className="px-2 py-1 rounded text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600"
          title="글자 색상"
        >
          <span className="flex items-center gap-1">
            A<span className="inline-block h-2 w-4 rounded" style={{ background: editor.getAttributes("textStyle").color || "#000" }} />
          </span>
        </button>
        {showColors && (
          <div className="absolute top-full left-0 z-50 mt-1 grid grid-cols-7 gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-600 dark:bg-slate-700">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  editor.chain().focus().setColor(c).run();
                  setShowColors(false);
                }}
                className="h-5 w-5 rounded border border-slate-300 dark:border-slate-500"
                style={{ background: c }}
                title={c}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setShowColors(false);
              }}
              className="col-span-7 mt-1 rounded px-2 py-0.5 text-xs text-red-600 hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              색상 초기화
            </button>
          </div>
        )}
      </div>

      <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="왼쪽 정렬"
      >
        ≡←
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="가운데 정렬"
      >
        ≡↔
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="오른쪽 정렬"
      >
        →≡
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

      <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="링크">
        🔗
      </ToolbarButton>

      <ToolbarButton onClick={addImage} title="이미지 업로드">
        🖼️
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

export default function TiptapEditor({ content, onChange, className }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextStyle,
      TiptapFontSize,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      ResizableImage.configure({ inline: false, allowBase64: true }),
    ],
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || "");
    }
  }, [content]);

  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${className || ""}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
