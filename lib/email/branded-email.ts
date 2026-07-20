export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Convert plain text (paragraphs separated by blank lines) to simple HTML. */
export function plainTextToHtml(text: string): string {
    return text
        .trim()
        .split(/\n\n+/)
        .map(p => `<p style="margin:0 0 12px;line-height:1.6;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

export function buildBrandedEmail(opts: {
    headerTitle: string;
    subtitle: string;
    recipientName: string;
    bodyHtml: string;
    signOff?: string;
    headerBg?: string;
}): string {
    const signOff = opts.signOff ?? '— The AgriPro Team';
    const headerBg = opts.headerBg ?? '#0B2C24';

    return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:${headerBg};padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">${escapeHtml(opts.headerTitle)}</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">${escapeHtml(opts.subtitle)}</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
<p style="margin:0 0 16px;">Hi ${escapeHtml(opts.recipientName)},</p>
${opts.bodyHtml}
<p style="margin-top:24px;color:#6b7280;font-size:14px;">${escapeHtml(signOff)}</p>
</div></div>`;
}
