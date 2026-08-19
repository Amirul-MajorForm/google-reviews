import { AnalysisResult } from '@/types/analysis'

const MOCK_REVIEWS = [
  { author: 'Sarah M.', rating: 5, date: '2024-11-01', place: 'SkinLab Aesthetic Clinic', text: 'I had Ultherapy done on my neck and lower face 6 months ago and the results have been phenomenal. My skin is visibly tighter and I get compliments all the time. The procedure itself was uncomfortable but totally manageable. Zero downtime — I went back to work the next day.' },
  { author: 'Rachel T.', rating: 4, date: '2024-10-15', place: 'The Aesthetic Centre', text: 'Good results overall but it took about 4 months to really see a difference. The pain was real — I would rate it a 6/10 — but they gave me numbing cream which helped. Would recommend but make sure you go to an experienced provider and set realistic expectations.' },
  { author: 'James L.', rating: 2, date: '2024-10-02', place: 'Premier Skin Solutions', text: 'Very expensive for the results I saw. I paid $2,800 and after 6 months barely noticed any change. The staff were kind and professional but I wish I had more thorough expectations set before the procedure. Felt misleading.' },
  { author: 'Priya K.', rating: 5, date: '2024-09-20', place: 'Glow Aesthetic Studio', text: 'Best investment I\'ve made in my skin. 52 years old and people think I\'m in my early 40s. No surgery, no injectables — just Ultherapy twice now. The results compound. Absolutely worth it.' },
  { author: 'Michelle W.', rating: 3, date: '2024-09-10', place: 'SkinLab Aesthetic Clinic', text: 'The treatment was more painful than I expected. Results are subtle — I can see a slight improvement in my jawline but nothing dramatic. The clinic was professional and clean. Not sure I\'d do it again at this price point.' },
  { author: 'Natasha B.', rating: 5, date: '2024-08-28', place: 'Revive Medical Aesthetics', text: 'Completely non-invasive and no recovery time. I had it done on a Friday and went to a function Saturday night. 5 months later my neck and chin look 10 years younger. The sonogram imaging means the provider can actually see exactly where they\'re treating — it\'s real technology, not just a marketing gimmick.' },
  { author: 'David C.', rating: 4, date: '2024-08-15', place: 'The Aesthetic Centre', text: 'I was skeptical going in but the results speak for themselves. Forehead and brow lift after just one session. Took 3 months to fully kick in but now I\'m very happy. Pain was maybe a 5/10 — totally bearable with the topical anaesthetic they provided.' },
  { author: 'Lisa H.', rating: 1, date: '2024-08-05', place: 'Glow Aesthetic Studio', text: 'Absolutely no results after 6 months. I spent $3,500 on this and cannot see any difference whatsoever. I would not recommend this to anyone.' },
  { author: 'Amanda F.', rating: 5, date: '2024-07-22', place: 'Luminary Skin Clinic', text: 'The science behind Ultherapy is impressive — it uses ultrasound to stimulate collagen deep in the skin. I noticed results from around month 3. My skin has a tightness and glow it hasn\'t had in years. No bruising, no swelling. Perfect for someone who doesn\'t want to go under the knife.' },
  { author: 'Tom R.', rating: 4, date: '2024-07-10', place: 'Revive Medical Aesthetics', text: 'Men can benefit from this too. Got it done on my neck and jawline. Results took time but by month 4 I could see real definition coming back. The technician was skilled and the mapping beforehand was reassuring.' },
  { author: 'Fiona G.', rating: 5, date: '2024-06-30', place: 'SkinLab Aesthetic Clinic', text: 'I\'ve now done Ultherapy three times over 5 years and it genuinely maintains a youthful appearance without surgery. The sessions get easier each time as I know what to expect. The collagen stimulation is real and cumulative.' },
  { author: 'Karen S.', rating: 3, date: '2024-06-18', place: 'Premier Skin Solutions', text: 'Mixed experience. The procedure was painful (honest 7/10 for me) and I had some facial soreness for about a week. Results were mild — a bit of lifting in the brow area. My sister had amazing results from the same clinic so it seems to vary by person.' },
  { author: 'Jessica N.', rating: 5, date: '2024-06-05', place: 'Luminary Skin Clinic', text: 'The ability to target different depths of tissue sets Ultherapy apart from other treatments. My doctor explained the science thoroughly before starting. By month 5 my skin looked significantly lifted — friends thought I\'d had surgery. That\'s the best compliment possible.' },
  { author: 'Mark D.', rating: 4, date: '2024-05-20', place: 'The Aesthetic Centre', text: 'Good results but patience is required. You won\'t see anything for at least 2-3 months — the collagen building takes time. I\'m 6 months post-treatment and very pleased with my neck and jawline. The real-time imaging during the treatment was impressive.' },
  { author: 'Olivia P.', rating: 2, date: '2024-05-08', place: 'Glow Aesthetic Studio', text: 'The pain level was not communicated clearly upfront. I had to stop the treatment halfway through because it was so intense. The clinic was apologetic and offered to reschedule but I\'m not sure I want to go back.' },
  { author: 'Catherine L.', rating: 5, date: '2024-04-25', place: 'Revive Medical Aesthetics', text: 'Non-surgical facelift is a perfect way to describe it. I\'m 60 and my results have been incredible — better than I expected. The fact that there\'s no downtime makes it accessible. I did both full face and neck for maximum effect.' },
  { author: 'Sophie A.', rating: 5, date: '2024-04-12', place: 'SkinLab Aesthetic Clinic', text: 'Highly recommend to anyone considering a non-surgical approach to ageing. The provider was extremely skilled and explained every step. 4 months later I can see a clear brow lift and my neck is much tighter. Friends have been asking what I\'ve done.' },
  { author: 'Helen K.', rating: 3, date: '2024-03-28', place: 'Luminary Skin Clinic', text: 'Results were underwhelming for the price. I can see a small improvement but nothing life-changing. The treatment was professional and well-executed. I think expectation-setting is key — if you want dramatic results, this might disappoint.' },
  { author: 'Patricia M.', rating: 4, date: '2024-03-15', place: 'Premier Skin Solutions', text: 'Six months on and I\'m happy with my decision. Subtle but real lifting along the jawline and reduced neck laxity. The treatment was uncomfortable but brief. The clinic has a very clinical, trustworthy feel — not a spa.' },
  { author: 'Rose C.', rating: 5, date: '2024-03-01', place: 'The Aesthetic Centre', text: 'The longevity of results is what makes Ultherapy worth the investment. I\'m 18 months post-treatment and still maintaining the benefit. My consultant said collagen production can continue for up to a year after the procedure — that explains the sustained results.' },
  { author: 'Anna B.', rating: 4, date: '2024-02-18', place: 'Revive Medical Aesthetics', text: 'Much better than fillers for my specific concern — I had mild jowling and it has genuinely improved. Zero recovery time. I was out for lunch an hour after my appointment. Will absolutely do it again.' },
  { author: 'Nina W.', rating: 1, date: '2024-02-05', place: 'SkinLab Aesthetic Clinic', text: 'Terrible experience. The clinic oversold the results. After 8 months I see no change. $4,000 down the drain. Very disappointed and feel misled by their marketing.' },
  { author: 'Deborah H.', rating: 5, date: '2024-01-22', place: 'Luminary Skin Clinic', text: 'The precision of this treatment is remarkable. The ultrasound imaging allows the practitioner to target exactly the right tissue layer. Results have been exceptional — I look 8-10 years younger. No pain at all with their numbing protocol.' },
  { author: 'Claire F.', rating: 4, date: '2024-01-10', place: 'Premier Skin Solutions', text: 'Worth the wait. By month 4 I noticed my skin looking tighter and more defined. The procedure is well tolerated. I appreciated that the practitioner showed me the ultrasound images during treatment so I could see exactly what was happening.' },
  { author: 'Mary J.', rating: 5, date: '2023-12-28', place: 'Glow Aesthetic Studio', text: 'I\'ve tried many non-surgical treatments over the years and Ultherapy gives the most convincing results. Genuine lifting, not just a temporary effect. The fact that it stimulates your own collagen means the results feel natural, not pulled.' },
  { author: 'Linda T.', rating: 3, date: '2023-12-15', place: 'The Aesthetic Centre', text: 'OK but not the miracle treatment it\'s sometimes marketed as. I saw moderate improvement in my chin and neck area. Pain was manageable. Just go in with realistic expectations and you won\'t be disappointed.' },
  { author: 'Brenda O.', rating: 5, date: '2023-12-01', place: 'Revive Medical Aesthetics', text: 'Third time doing Ultherapy and each time it gets better. I combine it with skincare and the results are outstanding. No needles, no surgery, no downtime — it fits perfectly into my lifestyle. My face at 58 looks better than it did at 50.' },
  { author: 'Janet S.', rating: 4, date: '2023-11-18', place: 'SkinLab Aesthetic Clinic', text: 'Solid treatment with real results. I had my brow, chin and neck done. Results came at about month 3-4 and have continued improving. The discomfort during treatment is worth it for the outcome.' },
  { author: 'Gloria R.', rating: 2, date: '2023-11-05', place: 'Luminary Skin Clinic', text: 'Too painful for me. I have a low pain threshold and despite the numbing cream it was really uncomfortable. I could not complete the full neck treatment. The results I can see are minimal. Maybe not for everyone.' },
  { author: 'Frances N.', rating: 5, date: '2023-10-22', place: 'Premier Skin Solutions', text: 'Outstanding results at 65. My dermatologist recommended Ultherapy as an alternative to surgery and I\'m so glad I listened. 7 months on and I look refreshed without looking done. My family have commented on how well I look — nobody suspects a treatment.' },
]

export function getMockAnalysisResult(query: string, location?: string): AnalysisResult {
  const reviews = MOCK_REVIEWS.map(r => ({
    ...r,
    sentiment: r.rating >= 4 ? 'positive' as const : r.rating === 3 ? 'neutral' as const : 'negative' as const,
    themes: r.rating >= 4
      ? ['Results', 'Non-surgical', 'No downtime']
      : r.rating === 3
      ? ['Mild results', 'Pain level', 'Expectations']
      : ['Poor results', 'Pain', 'Cost-value'],
  }))

  const total = reviews.length
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / total
  const ratingCounts = [0, 0, 0, 0, 0]
  for (const r of reviews) ratingCounts[Math.round(r.rating) - 1]++

  return {
    query,
    location,
    totalReviews: total,
    placesCount: 6,
    averageRating: Math.round(avgRating * 10) / 10,
    ratingDistribution: [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: ratingCounts[stars - 1],
      pct: Math.round((ratingCounts[stars - 1] / total) * 100),
    })),
    sentiment: { positive: 60, neutral: 17, negative: 23 },
    executiveSummary:
      'Ultherapy reviews skew strongly positive among patients who set realistic expectations, with most praising its non-surgical, zero-downtime profile and visible lifting results from month 3-4 onward. The most consistent criticism centres on pain during treatment and the minority of patients who experience underwhelming results — both of which correlate closely with provider skill and pre-treatment expectation-setting. For prospects weighing Ultherapy against surgery, the patient narrative is compelling: real results without recovery time.',
    topPros: [
      'No downtime — patients resume normal life immediately',
      'Natural-looking, gradual results that don\'t look "done"',
      'Collagen production continues up to 12 months post-treatment',
      'Real-time ultrasound imaging provides precision and trust',
      'Results maintained 12-18+ months, reducing repeat treatment frequency',
      'Effective for neck, chin, brow and full face in one session',
    ],
    topCons: [
      'Pain during treatment (rated 5-7/10 by many)',
      'High cost ($2,800-$4,000+) with inconsistent results',
      'Results take 3-6 months to fully manifest',
      'A minority of patients see little to no change',
      'Expectation-setting varies significantly by clinic',
      'Discomfort may require treatment to be paused or stopped',
    ],
    keyThemes: [
      { theme: 'Results & Lifting', mentions: 24, sentiment: 'positive' },
      { theme: 'No Downtime', mentions: 19, sentiment: 'positive' },
      { theme: 'Pain Level', mentions: 16, sentiment: 'negative' },
      { theme: 'Results Timeline (3-6 months)', mentions: 15, sentiment: 'neutral' },
      { theme: 'Cost vs. Value', mentions: 12, sentiment: 'neutral' },
      { theme: 'Provider Skill & Trust', mentions: 11, sentiment: 'positive' },
      { theme: 'Collagen Stimulation Science', mentions: 9, sentiment: 'positive' },
      { theme: 'Expectation Management', mentions: 8, sentiment: 'neutral' },
    ],
    pitchAngles: [
      {
        angle: 'The no-downtime advantage is a genuine differentiator',
        supporting: 'Across 30+ reviews, patients consistently cite zero downtime as Ultherapy\'s standout feature. Multiple reviewers describe going to events, work, and social occasions the same day. This is a concrete, verifiable benefit that resonates strongly with active professionals.',
        quote: 'I had it done on a Friday and went to a function Saturday night. 5 months later my neck and chin look 10 years younger.',
      },
      {
        angle: 'Results read as natural — "people think I had surgery" is a recurring phrase',
        supporting: 'The gradual collagen-building mechanism means patients don\'t look "done." Multiple reviewers explicitly mention friends or family asking if they\'ve had surgery. This naturalness is a key purchase driver for patients who are surgery-averse.',
        quote: 'By month 5 my skin looked significantly lifted — friends thought I\'d had surgery. That\'s the best compliment possible.',
      },
      {
        angle: 'Real-time ultrasound imaging builds patient trust and justifies the premium',
        supporting: 'Several high-satisfaction reviews specifically call out the ultrasound imaging as proof the treatment is targeted and scientific — not a "marketing gimmick." This technical credibility supports premium pricing and differentiates from competitors.',
        quote: 'The sonogram imaging means the provider can actually see exactly where they\'re treating — it\'s real technology, not just a marketing gimmick.',
      },
      {
        angle: 'Collagen production compounding over time is a durable value argument',
        supporting: 'Reviews from patients 12-18 months post-treatment confirm continued benefit, with some noting results that compound with repeat sessions. This argues for Ultherapy as an investment, not a one-off spend.',
        quote: 'I\'ve now done Ultherapy three times over 5 years and it genuinely maintains a youthful appearance without surgery. The sessions get easier each time.',
      },
      {
        angle: 'Pain and expectation management are the primary risk factors — clinic selection matters',
        supporting: 'Negative reviews cluster around two themes: pain that was inadequately pre-communicated, and results that fell short of overpromised outcomes. Clinics that invest in pre-treatment consultation and numbing protocols consistently generate higher satisfaction. This is the key pitch to clinic partners.',
      },
    ],
    notableQuotes: [
      { text: 'I look 8-10 years younger. No pain at all with their numbing protocol.', rating: 5, author: 'Deborah H.' },
      { text: 'My face at 58 looks better than it did at 50.', rating: 5, author: 'Brenda O.' },
      { text: 'Friends have been asking what I\'ve done. The science is real.', rating: 5, author: 'Sophie A.' },
      { text: 'The longevity of results is what makes Ultherapy worth the investment. I\'m 18 months post-treatment and still maintaining the benefit.', rating: 5, author: 'Rose C.' },
      { text: 'I paid $2,800 and after 6 months barely noticed any change. Felt misleading.', rating: 2, author: 'James L.' },
      { text: 'Pain was not communicated clearly upfront. I had to stop the treatment halfway through.', rating: 2, author: 'Olivia P.' },
      { text: 'Results took time but by month 4 I could see real definition coming back.', rating: 4, author: 'Tom R.' },
      { text: 'Just go in with realistic expectations and you won\'t be disappointed.', rating: 3, author: 'Linda T.' },
    ],
    reviews,
    analyzedAt: new Date().toISOString(),
  }
}
