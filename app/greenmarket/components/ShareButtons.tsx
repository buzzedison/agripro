"use client";
import { useEffect, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

// WhatsApp first: it is how most buyers and sellers on the platform share listings.
export default function ShareButtons({ path, title, text }: { path: string; title: string; text: string }) {
  const [canShare, setCanShare] = useState(false);
  const [url, setUrl] = useState(path);
  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  const message = `${text}\n${url}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };
  const nativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error("Could not open sharing options");
    }
  };
  const button = "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1ebe5b]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3c.2-.5.2-1 .1-1.1l-.6-.4Z" /></svg>
        WhatsApp
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={button}>
        Facebook
      </a>
      <button type="button" onClick={copy} className={button}>
        <Copy className="h-4 w-4" /> Copy link
      </button>
      {canShare && (
        <button type="button" onClick={nativeShare} className={button} aria-label="More sharing options">
          <Share2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
