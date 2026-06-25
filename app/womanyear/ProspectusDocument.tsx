'use client';

import {
    Document, Page, Text, View, StyleSheet, pdf,
} from '@react-pdf/renderer';

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
    green: '#0B2C24',
    greenDeep: '#06140E',
    gold: '#F4C430',
    ink: '#1A2B25',
    gray: '#5F6B66',
    grayLight: '#9AA4A0',
    light: '#F9FAF9',
    line: '#E3E8E5',
    white: '#FFFFFF',
};

const s = StyleSheet.create({
    // Cover
    cover: { backgroundColor: C.greenDeep, color: C.white, paddingHorizontal: 48, paddingVertical: 54, flexDirection: 'column', justifyContent: 'space-between' },
    coverKicker: { fontSize: 9, letterSpacing: 3, color: C.gold, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
    coverRule: { width: 44, height: 2, backgroundColor: C.gold, marginTop: 14, marginBottom: 28 },
    coverTitle: { fontSize: 34, fontFamily: 'Helvetica-Bold', lineHeight: 1.12, marginBottom: 18, maxWidth: 420 },
    coverGold: { color: C.gold },
    coverSub: { fontSize: 13, color: '#C9D6CF', lineHeight: 1.5, maxWidth: 360, marginBottom: 16 },
    coverTag: { fontSize: 10, letterSpacing: 2, color: C.white, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
    coverDates: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)', paddingTop: 18 },
    coverDateItem: { flex: 1, paddingRight: 10 },
    coverDateLabel: { fontSize: 7.5, letterSpacing: 1.5, color: C.grayLight, textTransform: 'uppercase', marginBottom: 4 },
    coverDateValue: { fontSize: 11, color: C.white, fontFamily: 'Helvetica-Bold' },
    coverFoot: { fontSize: 8.5, color: C.grayLight, marginTop: 22 },

    // Content pages
    page: { backgroundColor: C.white, paddingHorizontal: 48, paddingTop: 48, paddingBottom: 56, color: C.ink, fontFamily: 'Helvetica' },
    eyebrow: { fontSize: 8, letterSpacing: 2.5, color: C.gold, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 8 },
    h2: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 12, lineHeight: 1.15 },
    body: { fontSize: 10, color: C.gray, lineHeight: 1.55, marginBottom: 8 },
    bodyStrong: { color: C.ink, fontFamily: 'Helvetica-Bold' },
    block: { marginBottom: 26 },

    // Stat grid
    statRow: { flexDirection: 'row', marginTop: 6, marginBottom: 6 },
    statCell: { width: '50%', paddingVertical: 10, paddingRight: 14 },
    statValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.green },
    statLabel: { fontSize: 8, letterSpacing: 1, color: C.grayLight, textTransform: 'uppercase', marginTop: 3 },

    // Step / list cards
    step: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
    stepNum: { width: 22, fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.gold },
    stepBody: { flex: 1 },
    stepTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 2 },
    stepDesc: { fontSize: 9.5, color: C.gray, lineHeight: 1.45 },

    // Two-column row
    twoCol: { flexDirection: 'row', flexWrap: 'wrap' },
    colItem: { width: '50%', paddingRight: 16, marginBottom: 14 },
    colTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 3 },
    colDesc: { fontSize: 9, color: C.gray, lineHeight: 1.45 },

    // Pricing
    priceRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 12, alignItems: 'center' },
    priceName: { width: '46%', fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: C.ink },
    priceDesc: { width: '34%', fontSize: 8.5, color: C.gray, lineHeight: 1.4 },
    priceAmt: { width: '20%', fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.green, textAlign: 'right' },

    // Footer
    footer: { position: 'absolute', bottom: 28, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10 },
    footerText: { fontSize: 7.5, color: C.grayLight },

    // CTA band
    ctaBand: { backgroundColor: C.green, borderRadius: 8, padding: 22 },
    ctaTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 6 },
    ctaBody: { fontSize: 9.5, color: '#C9D6CF', lineHeight: 1.5, marginBottom: 4 },
    ctaGold: { color: C.gold, fontFamily: 'Helvetica-Bold' },
});

const Footer = ({ page }: { page: string }) => (
    <View style={s.footer} fixed>
        <Text style={s.footerText}>AgriPro Catalyst W · Cohort 2026</Text>
        <Text style={s.footerText}>{page}</Text>
    </View>
);

function ProspectusDocument() {
    return (
        <Document
            title="AgriPro Catalyst W — Prospectus 2026"
            author="AgriPro"
            subject="The Pan-African Accelerator for Women Agripreneurs"
        >
            {/* ── COVER ───────────────────────────────────────────────── */}
            <Page size="A4" style={s.cover}>
                <View>
                    <Text style={s.coverKicker}>AgriPro Catalyst W · Prospectus 2026</Text>
                    <View style={s.coverRule} />
                    <Text style={s.coverTitle}>
                        The Pan-African Launchpad for{' '}
                        <Text style={s.coverGold}>Women Agripreneurs.</Text>
                    </Text>
                    <Text style={s.coverSub}>
                        A 12-week, action-oriented accelerator connecting 40 women agribusiness owners
                        directly to the partners, markets and capital they need.
                    </Text>
                    <Text style={s.coverTag}>Not a course. A catalyst.</Text>
                </View>

                <View>
                    <View style={s.coverDates}>
                        <View style={s.coverDateItem}>
                            <Text style={s.coverDateLabel}>Applications open</Text>
                            <Text style={s.coverDateValue}>July 6, 2026</Text>
                        </View>
                        <View style={s.coverDateItem}>
                            <Text style={s.coverDateLabel}>Accelerator</Text>
                            <Text style={s.coverDateValue}>Sep 1 – Nov 23</Text>
                        </View>
                        <View style={s.coverDateItem}>
                            <Text style={s.coverDateLabel}>Summit · Kigali</Text>
                            <Text style={s.coverDateValue}>December 2026</Text>
                        </View>
                    </View>
                    <Text style={s.coverFoot}>2026 — UN International Year of the Woman Farmer</Text>
                </View>
            </Page>

            {/* ── PAGE 2 — Opportunity + What it is ───────────────────── */}
            <Page size="A4" style={s.page}>
                <View style={s.block}>
                    <Text style={s.eyebrow}>The Opportunity</Text>
                    <Text style={s.h2}>A once-in-a-generation inflection point.</Text>
                    <Text style={s.body}>
                        Women make up 80% of Africa&apos;s agricultural labour, yet a $100B financing gap
                        holds them back. Closing it is one of the largest economic opportunities on the
                        continent — and Catalyst W is built to convert it into real businesses, deals and jobs.
                    </Text>
                    <View style={s.statRow}>
                        <View style={s.statCell}>
                            <Text style={s.statValue}>$1 Trillion</Text>
                            <Text style={s.statLabel}>Potential GDP increase</Text>
                        </View>
                        <View style={s.statCell}>
                            <Text style={s.statValue}>45 Million</Text>
                            <Text style={s.statLabel}>People lifted from insecurity</Text>
                        </View>
                    </View>
                </View>

                <View style={s.block}>
                    <Text style={s.eyebrow}>How it works</Text>
                    <Text style={s.h2}>We don&apos;t teach a curriculum. We solve your specific problem.</Text>
                    <Text style={s.body}>
                        Every founder enters with a different bottleneck — so we run a simple, repeatable
                        engine on <Text style={s.bodyStrong}>your</Text> business: diagnose the real
                        constraint, then make the exact connection that breaks it.
                    </Text>

                    <View style={{ marginTop: 8 }}>
                        <View style={s.step}>
                            <Text style={s.stepNum}>01</Text>
                            <View style={s.stepBody}>
                                <Text style={s.stepTitle}>Assess</Text>
                                <Text style={s.stepDesc}>We diagnose your single biggest constraint right now — capital, market access, supply or compliance. No generic syllabus.</Text>
                            </View>
                        </View>
                        <View style={s.step}>
                            <Text style={s.stepNum}>02</Text>
                            <View style={s.stepBody}>
                                <Text style={s.stepTitle}>Connect</Text>
                                <Text style={s.stepDesc}>We introduce you directly to the one partner who can move the needle — an investor, an offtake buyer, a logistics provider or a policymaker.</Text>
                            </View>
                        </View>
                        <View style={s.step}>
                            <Text style={s.stepNum}>03</Text>
                            <View style={s.stepBody}>
                                <Text style={s.stepTitle}>Equip</Text>
                                <Text style={s.stepDesc}>Targeted prep — pitch coaching, data room, term-sheet readiness — so you walk into that connection ready to close, not just talk.</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <Footer page="01" />
            </Page>

            {/* ── PAGE 3 — Who applies + tracks + advantage ───────────── */}
            <Page size="A4" style={s.page}>
                <View style={s.block}>
                    <Text style={s.eyebrow}>Who we&apos;re looking for</Text>
                    <Text style={s.h2}>40 ventures. One bar: ready to scale.</Text>
                    <View style={s.twoCol}>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Woman founder / co-founder</Text>
                            <Text style={s.colDesc}>Led or co-led by a woman.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Post-revenue ($5k+)</Text>
                            <Text style={s.colDesc}>A business already trading, not just an idea.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Scalable model</Text>
                            <Text style={s.colDesc}>Built to grow beyond the founder.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Africa-rooted</Text>
                            <Text style={s.colDesc}>Operating in an African market.</Text>
                        </View>
                    </View>
                </View>

                <View style={s.block}>
                    <Text style={s.eyebrow}>Four high-impact tracks</Text>
                    <View style={s.twoCol}>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Farm Tech</Text>
                            <Text style={s.colDesc}>Climate-smart production, IoT, drones, biological inputs.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Value Addition</Text>
                            <Text style={s.colDesc}>Processing, packaging, food safety, dairy alternatives.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Market Infrastructure</Text>
                            <Text style={s.colDesc}>Logistics, cold chain, B2B platforms.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Agri-Fintech</Text>
                            <Text style={s.colDesc}>Credit, insurance, cooperative tech.</Text>
                        </View>
                    </View>
                </View>

                <View style={s.block}>
                    <Text style={s.eyebrow}>The unfair advantage</Text>
                    <Text style={s.h2}>Most accelerators give you a contact. We give you a connection that&apos;s real.</Text>
                    <Text style={s.body}>
                        Because AgriPro operates the market rails, the partners we connect you to can
                        actually transact — not a warm intro you chase for months.
                    </Text>
                    <View style={[s.twoCol, { marginTop: 6 }]}>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Market data</Text>
                            <Text style={s.colDesc}>Defensible pricing & demand figures for your pitch.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Logistics</Text>
                            <Text style={s.colDesc}>Cold storage and transport so you can fulfil orders.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Offtake</Text>
                            <Text style={s.colDesc}>Guaranteed buyer trials that become real contracts.</Text>
                        </View>
                        <View style={s.colItem}>
                            <Text style={s.colTitle}>Policy access</Text>
                            <Text style={s.colDesc}>Direct lines to the ministries shaping your market.</Text>
                        </View>
                    </View>
                </View>
                <Footer page="02" />
            </Page>

            {/* ── PAGE 4 — Timeline + Summit + Investment + Apply ─────── */}
            <Page size="A4" style={s.page}>
                <View style={s.block}>
                    <Text style={s.eyebrow}>The programme</Text>
                    <Text style={s.h2}>12 weeks of action. September 1 – November 23, 2026.</Text>
                    <View style={{ marginTop: 4 }}>
                        <View style={s.step}>
                            <Text style={s.stepNum}>1–3</Text>
                            <View style={s.stepBody}><Text style={s.stepTitle}>Diagnose</Text><Text style={s.stepDesc}>Deep-dive on your business to pinpoint the constraint to break.</Text></View>
                        </View>
                        <View style={s.step}>
                            <Text style={s.stepNum}>4–7</Text>
                            <View style={s.stepBody}><Text style={s.stepTitle}>Matchmake</Text><Text style={s.stepDesc}>Direct introductions to the partner who can unlock your next stage.</Text></View>
                        </View>
                        <View style={s.step}>
                            <Text style={s.stepNum}>8–10</Text>
                            <View style={s.stepBody}><Text style={s.stepTitle}>Prepare</Text><Text style={s.stepDesc}>Pitch, data room and negotiation prep, built for the specific deal.</Text></View>
                        </View>
                        <View style={s.step}>
                            <Text style={s.stepNum}>11–12</Text>
                            <View style={s.stepBody}><Text style={s.stepTitle}>Close</Text><Text style={s.stepDesc}>Convert the connection — lock in capital, offtake or partnership.</Text></View>
                        </View>
                    </View>
                </View>

                <View style={s.block}>
                    <Text style={s.eyebrow}>The Summit · Africa Food Futures</Text>
                    <Text style={s.h2}>Kigali, first week of December 2026.</Text>
                    <Text style={s.body}>
                        The programme culminates in an action-oriented summit showcasing the 40 accelerator
                        founders and 25 fellows. Not abstract panels — every attendee is mobilised into
                        focused work groups built to deliver tangible support: capital, contracts and commitments.
                    </Text>
                </View>

                <View style={s.block}>
                    <Text style={s.eyebrow}>Your investment</Text>
                    <View style={s.priceRow}>
                        <Text style={s.priceName}>Standard Access</Text>
                        <Text style={s.priceDesc}>Full programme + Summit</Text>
                        <Text style={s.priceAmt}>$1,000</Text>
                    </View>
                    <View style={s.priceRow}>
                        <Text style={s.priceName}>Subsidized</Text>
                        <Text style={s.priceDesc}>LDCs & climate-vulnerable regions</Text>
                        <Text style={s.priceAmt}>$399</Text>
                    </View>
                    <View style={s.priceRow}>
                        <Text style={s.priceName}>Scholarship</Text>
                        <Text style={s.priceDesc}>Limited slots for exceptional founders</Text>
                        <Text style={[s.priceAmt, { fontSize: 10 }]}>Fully Funded</Text>
                    </View>
                </View>

                <View style={s.ctaBand}>
                    <Text style={s.ctaTitle}>Apply for Cohort 2026</Text>
                    <Text style={s.ctaBody}>
                        Applications open <Text style={s.ctaGold}>July 6, 2026</Text> and close end of August.
                    </Text>
                    <Text style={s.ctaBody}>
                        Apply at <Text style={s.ctaGold}>agripro.com/womanyear</Text>
                    </Text>
                </View>
                <Footer page="03" />
            </Page>
        </Document>
    );
}

export async function generateProspectusBlob(): Promise<Blob> {
    return pdf(<ProspectusDocument />).toBlob();
}

export default ProspectusDocument;
