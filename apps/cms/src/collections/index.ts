/** Collection registry — Plane A (Payload-owned). Order groups admin nav sensibly. */
import { Users } from './Users.ts';
import { Media } from './Media.ts';
import { Articles } from './Articles.ts';
import { Services } from './Services.ts';
import { ServicePages } from './ServicePages.ts';
import { Subclasses } from './Subclasses.ts';
import { Situations } from './Situations.ts';
import { FAQs } from './FAQs.ts';
import { TeamMembers } from './TeamMembers.ts';
import { Testimonials } from './Testimonials.ts';
import { CaseStudies } from './CaseStudies.ts';
import { ProcessingTimes } from './ProcessingTimes.ts';
import { PinnedReviews } from './PinnedReviews.ts';
import { SuccessStories } from './SuccessStories.ts';
import { Leads } from './Leads.ts';
import { Consultations } from './Consultations.ts';
import { Redirects } from './Redirects.ts';
import { AuditLog } from './AuditLog.ts';

// Order drives the admin sidebar. Visible, editor-facing collections first, grouped
// (Media · Blog & Resources · Website Content · Enquiries · System), then the hidden
// internal/reference collections (which never appear in the nav).
export const collections = [
  // Media
  Media,
  // Blog & Resources
  Articles,
  // Website Content
  ServicePages,
  TeamMembers,
  PinnedReviews,
  Testimonials,
  SuccessStories,
  // Enquiries
  Leads,
  Consultations,
  // System
  Users,
  // Hidden / internal (not shown in the nav)
  Services,
  Subclasses,
  Situations,
  FAQs,
  CaseStudies,
  ProcessingTimes,
  Redirects,
  AuditLog,
];
