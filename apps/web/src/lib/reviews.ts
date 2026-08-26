/**
 * Curated GENUINE Google reviews from the practice's Google Business Profile.
 *
 * Real content — not fabricated. Shaped to the GoogleReviews component's `pinned`
 * prop ({ reviewerName, rating, text, reviewDate }) so any page can pass them as a
 * fallback that shows real client words when the live Google Places API isn't
 * configured and the CMS "pinned reviews" collection is empty. The live API and CMS
 * pinned reviews always take precedence over this list.
 *
 * NOTE: dates are the relative labels shown on Google at time of capture and will
 * drift; replace with fixed month/year if/when confirmed. Ratings are 5★ per the
 * profile; correct here if any differ.
 */
export interface CuratedReview {
  reviewerName: string;
  rating: number;
  text: string;
  reviewDate: string;
}

export const CURATED_REVIEWS: CuratedReview[] = [
  {
    reviewerName: 'Utshab Bhusal',
    rating: 5,
    reviewDate: '4 months ago',
    text: 'I recently received my subclass 190 visa as a Chef. He really simplified the process and broke down each and every section, which relieved me from stress and gave me time to focus back on my work and wellbeing. He was very flexible with his schedule whenever I needed guidance and offered me the best service in Perth. I would recommend him as your migration agent based on my experience.',
  },
  {
    reviewerName: 'Saroj Naharki',
    rating: 5,
    reviewDate: '7 months ago',
    text: "I had a great experience applying for my mum's visa through Sunil. He was professional and always ready to help. Thanks to his guidance, I would definitely recommend him to others.",
  },
  {
    reviewerName: 'Bhumika Aryal',
    rating: 5,
    reviewDate: 'a year ago',
    text: "I had a great experience working with Sunil during my visa process. He proved to be a very reliable and trustworthy person throughout. He consistently kept me updated with all the documentation and every step of the process, which made everything smooth and stress-free. I'm very happy with his service and would highly recommend him.",
  },
  {
    reviewerName: 'Shasank Pathak',
    rating: 5,
    reviewDate: '7 months ago',
    text: 'Thank you Visa & Migration Doctors for your honest advice and constant support. The whole process was smooth and well guided. We truly felt looked after. Highly recommended to anyone needing visa assistance.',
  },
  {
    reviewerName: 'Savyna GC',
    rating: 5,
    reviewDate: '2 months ago',
    text: 'Excellent team and outstanding service. Highly recommended for everyone who is struggling for trustworthy and reliable advice.',
  },
  {
    reviewerName: 'Laxmi Sharma',
    rating: 5,
    reviewDate: 'a year ago',
    text: "Sunil has been one of the most professional, efficient, and supportive individuals I've ever known. I highly recommend seeking his help if you're looking for excellent service.",
  },
];
