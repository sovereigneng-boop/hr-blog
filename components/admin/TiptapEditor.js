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
import { createPortal } from "react-dom";

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
      href: {
        default: null,
        parseHTML: (el) => {
          if (el.parentElement?.tagName === "A") return el.parentElement.getAttribute("href");
          return el.getAttribute("data-href") || null;
        },
        renderHTML: (attrs) => {
          if (!attrs.href) return {};
          return { "data-href": attrs.href };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement("div");
      wrapper.style.textAlign = node.attrs.textAlign || "";

      const container = document.createElement("div");
      container.style.display = "inline-block";
      container.style.position = "relative";
      container.style.lineHeight = "0";
      container.style.borderRadius = "4px";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      if (node.attrs.width) {
        img.style.width = node.attrs.width;
      } else {
        img.style.maxWidth = "100%";
      }
      img.style.display = "block";
      img.style.cursor = "pointer";

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
        display: "none",
      });

      const linkBadge = document.createElement("div");
      Object.assign(linkBadge.style, {
        position: "absolute",
        top: "6px",
        right: "6px",
        width: "22px",
        height: "22px",
        background: "rgba(37, 99, 235, 0.85)",
        borderRadius: "6px",
        display: node.attrs.href ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        lineHeight: "1",
        pointerEvents: "none",
      });
      linkBadge.textContent = "🔗";

      let currentHref = node.attrs.href || null;

      function updateSelectionStyle() {
        const pos = getPos();
        const selected =
          typeof pos === "number" &&
          editor.state.selection.node != null &&
          editor.state.selection.from === pos;
        if (selected) {
          container.style.outline = "2px solid #2563EB";
          container.style.outlineOffset = "2px";
          handle.style.display = "block";
        } else {
          container.style.outline = "none";
          container.style.outlineOffset = "0";
          handle.style.display = "none";
        }
      }

      const onSelectionUpdate = () => updateSelectionStyle();
      editor.on("selectionUpdate", onSelectionUpdate);
      updateSelectionStyle();

      container.appendChild(img);
      container.appendChild(handle);
      container.appendChild(linkBadge);
      wrapper.appendChild(container);

      let startX = 0;
      let startW = 0;

      function onHandleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        startX = e.clientX;
        startW = img.offsetWidth;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }

      function onMouseMove(e) {
        const w = Math.max(50, startW + (e.clientX - startX));
        img.style.width = w + "px";
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        const pos = getPos();
        if (typeof pos === "number") {
          editor.chain().focus().setNodeSelection(pos).updateAttributes("image", {
            width: img.style.width,
          }).run();
        }
      }

      container.addEventListener("mousedown", (e) => {
        if (e.target === handle) return;
        e.preventDefault();
        const pos = getPos();
        if (typeof pos === "number") {
          editor.chain().focus().setNodeSelection(pos).run();
          const ref = editor.storage.linkActionsRef;
          if (currentHref) {
            if (e.ctrlKey || e.metaKey) {
              window.open(currentHref, "_blank");
            } else if (ref?.current) {
              const rect = container.getBoundingClientRect();
              ref.current.showPopup(currentHref, { bottom: rect.bottom, left: rect.left }, true);
            }
          } else if (ref?.current) {
            ref.current.hidePopup();
          }
        }
      });
      handle.addEventListener("mousedown", onHandleMouseDown);

      return {
        dom: wrapper,
        destroy() {
          editor.off("selectionUpdate", onSelectionUpdate);
          handle.removeEventListener("mousedown", onHandleMouseDown);
        },
        update(updatedNode) {
          if (updatedNode.type.name !== "image") return false;
          img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.width) img.style.width = updatedNode.attrs.width;
          wrapper.style.textAlign = updatedNode.attrs.textAlign || "";
          currentHref = updatedNode.attrs.href || null;
          linkBadge.style.display = currentHref ? "flex" : "none";
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

function isValidUrl(string) {
  if (!string) return false;
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function LinkPopup({ href, position, onCopy, onEdit, onDelete, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    function handleScroll() { onClose(); }
    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, [onClose]);

  if (!position) return null;

  const displayUrl = href.length > 40 ? href.slice(0, 40) + "\u2026" : href;

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-3"
      style={{
        top: Math.min(position.bottom + 6, window.innerHeight - 80),
        left: Math.max(8, Math.min(position.left, window.innerWidth - 260)),
      }}
    >
      <div className="text-xs text-blue-600 dark:text-blue-400 truncate max-w-[240px] mb-2" title={href}>
        {displayUrl}
      </div>
      <div className="flex gap-1.5">
        <button type="button" onClick={onCopy} className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300">
          복사
        </button>
        <button type="button" onClick={onEdit} className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300">
          수정
        </button>
        <button type="button" onClick={onDelete} className="px-2.5 py-1 text-xs rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400">
          삭제
        </button>
      </div>
    </div>,
    document.body
  );
}

function LinkInputModal({ isOpen, initialUrl, onConfirm, onCancel }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || "");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialUrl]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("URL을 입력하세요.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError("유효한 URL을 입력하세요.");
      return;
    }
    onConfirm(trimmed);
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-5 w-[400px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
          {initialUrl ? "링크 수정" : "링크 추가"}
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="https://example.com"
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-200 ${
              error
                ? "border-red-400 focus:ring-red-300"
                : "border-slate-300 dark:border-slate-600 focus:ring-blue-300"
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-sm rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function Toolbar({ editor, onLinkClick }) {
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

      <ToolbarButton onClick={onLinkClick} active={editor.isActive("link")} title="링크">
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
  const editorRef = useRef(null);
  const linkActionsRef = useRef({});
  const [linkPopup, setLinkPopup] = useState(null);
  const [linkModal, setLinkModal] = useState(null);

  linkActionsRef.current = {
    showPopup: (href, rect, isImage = false) => setLinkPopup({ href, rect, isImage }),
    hidePopup: () => setLinkPopup(null),
    openModal: (initialUrl, isEdit, isImage = false) => {
      setLinkPopup(null);
      setLinkModal({ initialUrl: initialUrl || "", isEdit, isImage });
    },
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextStyle,
      TiptapFontSize,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
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
      handleClick(view, pos, event) {
        const target = event.target instanceof HTMLElement ? event.target : event.target.parentElement;
        if (target?.closest("img") || target?.tagName === "IMG") return false;
        const link = target?.closest("a");
        if (link) {
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            window.open(link.href, "_blank");
            return true;
          }
          const rect = link.getBoundingClientRect();
          linkActionsRef.current.showPopup(link.href, { bottom: rect.bottom, left: rect.left });
          return true;
        }
        linkActionsRef.current.hidePopup();
        return false;
      },
      handleKeyDown(view, event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "k") {
          event.preventDefault();
          const ed = editorRef.current;
          if (ed) {
            const href = ed.isActive("link") ? (ed.getAttributes("link").href || "") : "";
            setTimeout(() => linkActionsRef.current.openModal(href, !!href), 0);
          }
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    if (editor) editor.storage.linkActionsRef = linkActionsRef;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        if (editor.isFocused()) {
          e.preventDefault();
          e.stopPropagation();
          const sel = editor.state.selection;
          if (sel.node?.type.name === "image") {
            const href = sel.node.attrs.href || "";
            linkActionsRef.current.openModal(href, !!href, true);
          } else {
            const href = editor.isActive("link") ? (editor.getAttributes("link").href || "") : "";
            linkActionsRef.current.openModal(href, !!href, false);
          }
        }
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [editor]);

  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || "");
    }
  }, [content]);

  const handleLinkConfirm = useCallback((url) => {
    if (!editor) return;
    if (linkModal?.isImage) {
      editor.chain().focus().updateAttributes("image", { href: url }).run();
    } else if (linkModal?.isEdit) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      const { from, to } = editor.state.selection;
      if (from === to) {
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
    setLinkModal(null);
  }, [editor, linkModal]);

  const handleLinkCancel = useCallback(() => {
    setLinkModal(null);
    editor?.chain().focus().run();
  }, [editor]);

  const handlePopupCopy = useCallback(() => {
    if (linkPopup?.href) navigator.clipboard.writeText(linkPopup.href);
    setLinkPopup(null);
  }, [linkPopup]);

  const handlePopupEdit = useCallback(() => {
    const href = linkPopup?.href || "";
    const isImage = linkPopup?.isImage || false;
    setLinkPopup(null);
    setLinkModal({ initialUrl: href, isEdit: true, isImage });
  }, [linkPopup]);

  const handlePopupDelete = useCallback(() => {
    if (editor) {
      if (linkPopup?.isImage) {
        editor.chain().focus().updateAttributes("image", { href: null }).run();
      } else {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      }
    }
    setLinkPopup(null);
  }, [editor, linkPopup]);

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const sel = editor.state.selection;
    if (sel.node?.type.name === "image") {
      const href = sel.node.attrs.href || "";
      setLinkModal({ initialUrl: href, isEdit: !!href, isImage: true });
    } else {
      const href = editor.isActive("link") ? (editor.getAttributes("link").href || "") : "";
      setLinkModal({ initialUrl: href, isEdit: !!href, isImage: false });
    }
  }, [editor]);

  return (
    <div className={`flex flex-col rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${className || ""}`}>
      <Toolbar editor={editor} onLinkClick={openLinkModal} />
      <div className="overflow-y-auto max-h-[70vh]">
        <EditorContent editor={editor} />
      </div>
      {linkPopup && (
        <LinkPopup
          href={linkPopup.href}
          position={linkPopup.rect}
          onCopy={handlePopupCopy}
          onEdit={handlePopupEdit}
          onDelete={handlePopupDelete}
          onClose={() => setLinkPopup(null)}
        />
      )}
      <LinkInputModal
        isOpen={!!linkModal}
        initialUrl={linkModal?.initialUrl || ""}
        onConfirm={handleLinkConfirm}
        onCancel={handleLinkCancel}
      />
    </div>
  );
}
