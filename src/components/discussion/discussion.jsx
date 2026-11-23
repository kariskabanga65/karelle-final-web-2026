import { MessageSquare, Trash2 } from "lucide-react";
import { deleteCommentAction } from "@/actions/comment-actions";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/auth/roles";
import { getDiscussion } from "@/lib/db/queries/comments";
import { formatRelative, getInitials } from "@/lib/utils/format";
import { CommentForm } from "./comment-form";
import { ReplyToggle } from "./reply-toggle";

export async function Discussion({ contentId, viewer, courseTeacherId }) {
  const { threads, total } = await getDiscussion(contentId);
  const canModerate = viewer.role === ROLES.ADMIN || viewer.id === courseTeacherId;

  return (
    <section id="diskusi" aria-labelledby="diskusi-title" className="scroll-mt-24 space-y-6">
      <div className="flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="eyebrow">Diskusi</p>
          <h2 id="diskusi-title" className="font-display text-3xl">Tanya & diskusi</h2>
        </div>
        <p className="text-sm text-muted-foreground">{total} komentar</p>
      </div>

      <CommentForm contentId={contentId} placeholder="Tulis pertanyaan atau pendapat Anda tentang materi ini..." />

      {threads.length > 0 ? (
        <ol className="space-y-5">
          {threads.map((thread) => (
            <li key={thread.id} className="rounded-xl border bg-card p-5 shadow-xs">
              <Comment comment={thread} viewer={viewer} canModerate={canModerate} />
              {thread.replies.length > 0 && (
                <ol className="mt-4 space-y-4 border-l-2 pl-4 sm:ml-12">
                  {thread.replies.map((reply) => (
                    <li key={reply.id}>
                      <Comment comment={reply} viewer={viewer} canModerate={canModerate} isReply />
                    </li>
                  ))}
                </ol>
              )}
              <div className="sm:ml-12">
                <ReplyToggle contentId={contentId} parentId={thread.id} authorName={thread.author_name} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center text-muted-foreground">
          <MessageSquare className="size-6" aria-hidden />
          <p className="text-sm">Belum ada diskusi. Jadilah yang pertama bertanya!</p>
        </div>
      )}
    </section>
  );
}

function Comment({ comment, viewer, canModerate, isReply = false }) {
  const canDelete = canModerate || comment.user_id === viewer.id;
  return (
    <article className="flex gap-3">
      <Avatar className={isReply ? "size-8" : "size-10"}>
        {comment.author_image && <AvatarImage src={comment.author_image} alt="" className="grayscale" />}
        <AvatarFallback className="bg-ink text-xs text-white">{getInitials(comment.author_name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{comment.author_name}</span>
          {comment.is_course_teacher && <Badge>Teacher</Badge>}
          {comment.author_role === ROLES.ADMIN && <Badge variant="outline">Admin</Badge>}
          <time dateTime={new Date(comment.created_at).toISOString()} className="text-xs text-muted-foreground">
            {formatRelative(comment.created_at)}
          </time>
        </header>
        <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-line">{comment.body}</p>
        {canDelete && (
          <ConfirmActionButton
            action={deleteCommentAction.bind(null, comment.id)}
            title="Hapus komentar?"
            description={isReply ? "Balasan ini akan dihapus permanen." : "Komentar ini beserta semua balasannya akan dihapus permanen."}
            triggerClassName="mt-1 h-8 px-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 /> Hapus
          </ConfirmActionButton>
        )}
      </div>
    </article>
  );
}
