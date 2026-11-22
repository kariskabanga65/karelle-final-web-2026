"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";


export function RichTextEditor({ name, defaultValue = "", invalid = false, describedBy, labelId }) {
  const [html, setHtml] = useState(defaultValue);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false, 
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TableKit.configure({ table: { resizable: false } }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose-karelle min-h-72 px-5 py-4 outline-none",
        role: "textbox",
        "aria-multiline": "true",
        ...(labelId ? { "aria-labelledby": labelId } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
      },
    },
    onUpdate: ({ editor: current }) => setHtml(current.isEmpty ? "" : current.getHTML()),
  });


  const active = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            table: e.isActive("table"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : {},
  });

  function applyLink(event) {
    event.preventDefault();
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const safe = /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href: safe }).run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  }

  const run = (fn) => () => fn(editor.chain().focus()).run();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white shadow-xs focus-within:ring-[3px] focus-within:ring-ring/40",
        invalid && "border-destructive",
      )}
    >
      <div role="toolbar" aria-label="Format teks" className="flex flex-wrap items-center gap-0.5 border-b bg-muted/60 p-1.5">
        <ToolButton label="Tebal" icon={Bold} pressed={active?.bold} onClick={run((c) => c.toggleBold())} disabled={!editor} />
        <ToolButton label="Miring" icon={Italic} pressed={active?.italic} onClick={run((c) => c.toggleItalic())} disabled={!editor} />
        <ToolButton label="Garis bawah" icon={Underline} pressed={active?.underline} onClick={run((c) => c.toggleUnderline())} disabled={!editor} />
        <ToolButton label="Coret" icon={Strikethrough} pressed={active?.strike} onClick={run((c) => c.toggleStrike())} disabled={!editor} />
        <Divider />
        <ToolButton label="Judul bagian" icon={Heading2} pressed={active?.h2} onClick={run((c) => c.toggleHeading({ level: 2 }))} disabled={!editor} />
        <ToolButton label="Sub judul" icon={Heading3} pressed={active?.h3} onClick={run((c) => c.toggleHeading({ level: 3 }))} disabled={!editor} />
        <Divider />
        <ToolButton label="Daftar poin" icon={List} pressed={active?.bullet} onClick={run((c) => c.toggleBulletList())} disabled={!editor} />
        <ToolButton label="Daftar bernomor" icon={ListOrdered} pressed={active?.ordered} onClick={run((c) => c.toggleOrderedList())} disabled={!editor} />
        <ToolButton label="Kutipan" icon={Quote} pressed={active?.quote} onClick={run((c) => c.toggleBlockquote())} disabled={!editor} />
        <ToolButton label="Garis pemisah" icon={Minus} onClick={run((c) => c.setHorizontalRule())} disabled={!editor} />
        <Divider />
        <ToolButton
          label={active?.link ? "Ubah link" : "Sisipkan link"}
          icon={Link2}
          pressed={active?.link || linkOpen}
          onClick={() => {
            setLinkUrl(editor?.getAttributes("link").href ?? "");
            setLinkOpen((open) => !open);
          }}
          disabled={!editor}
        />
        {active?.link && (
          <ToolButton label="Hapus link" icon={Link2Off} onClick={run((c) => c.extendMarkRange("link").unsetLink())} disabled={!editor} />
        )}
        <ToolButton
          label="Sisipkan tabel"
          icon={TableIcon}
          pressed={active?.table}
          onClick={run((c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }))}
          disabled={!editor || active?.table}
        />
        <Divider />
        <ToolButton label="Urungkan" icon={Undo2} onClick={run((c) => c.undo())} disabled={!editor || !active?.canUndo} />
        <ToolButton label="Ulangi" icon={Redo2} onClick={run((c) => c.redo())} disabled={!editor || !active?.canRedo} />
      </div>

      {active?.table && (
        <div className="flex flex-wrap gap-1 border-b bg-muted/30 px-2 py-1.5 text-xs">
          <span className="self-center px-1 text-muted-foreground">Tabel:</span>
          <TextButton onClick={run((c) => c.addRowAfter())}>+ Baris</TextButton>
          <TextButton onClick={run((c) => c.addColumnAfter())}>+ Kolom</TextButton>
          <TextButton onClick={run((c) => c.deleteRow())}>Hapus baris</TextButton>
          <TextButton onClick={run((c) => c.deleteColumn())}>Hapus kolom</TextButton>
          <TextButton onClick={run((c) => c.deleteTable())} className="text-destructive">Hapus tabel</TextButton>
        </div>
      )}

      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-3 py-2">
          <label htmlFor={`${name}-link`} className="text-xs text-muted-foreground">URL</label>
          <input
            id={`${name}-link`}
            type="url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && applyLink(event)}
            placeholder="https://contoh.com"
            className="h-8 min-w-56 flex-1 rounded-md border bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            autoFocus
          />
          <TextButton onClick={applyLink}>Terapkan</TextButton>
          <TextButton onClick={() => setLinkOpen(false)}>Batal</TextButton>
        </div>
      )}

      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-72 px-5 py-4 text-sm text-muted-foreground">Memuat editor...</div>
      )}
      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function ToolButton({ label, icon: Icon, pressed, onClick, disabled }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed === undefined ? undefined : Boolean(pressed)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-foreground/75 transition-colors hover:bg-white hover:text-foreground disabled:pointer-events-none disabled:opacity-35",
        pressed && "bg-ink text-white hover:bg-ink hover:text-white",
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

function TextButton({ onClick, className, children }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn("rounded-md px-2 py-1 font-medium hover:bg-white", className)}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}
