import { z } from 'zod';
import { attribution, country, email, firstName, nationality, phone, situation } from './common.ts';

/**
 * Visa Health Check — a CONDITION-BASED lead-capture questionnaire (Blueprint §9.3/§9.4).
 *
 * The client asks only the questions relevant to the person's selected pathway, so
 * most of the fields below are optional and populated only when that branch is shown.
 * This is a LEAD-CAPTURE questionnaire, not an assessment tool: it never computes or
 * returns an eligibility result — that judgement is human and happens after
 * submission.
 *
 * Backwards-compatibility: the whole validated object is stored in the schemaless
 * `leads.healthCheck` JSON field, so new questions need no CMS migration. Fields that
 * used to be required (`situation`, `location`, `everRefusedOrCancelled`) are now
 * optional because a branch may legitimately skip them — older submissions that DO
 * send them still validate unchanged.
 */
const yesNo = z.enum(['yes', 'no']);
const yesNoUnsure = z.enum(['yes', 'no', 'not-sure']);
const shortText = z.string().trim().max(200).optional();
const tinyText = z.string().trim().max(80).optional();

export const healthCheckSubmission = z.object({
  // Entry branch — the pathway the person selects first. Drives which questions show.
  pathway: z
    .enum(['study', 'work', 'permanent', 'partner', 'existing-visa', 'refusal', 'other'])
    .optional(),

  // Universal context (kept from the original flow; now optional so a branch may skip).
  situation: situation.optional(),
  location: z.enum(['australia', 'offshore']).optional(),
  country, // collected on the final contact step for every pathway
  nationality, // collected on the final contact step for every pathway
  currentVisa: z.string().trim().max(120).optional(), // existing-visa pathway: visa type
  goal: z
    .enum([
      'permanent-residence',
      'temporary-work',
      'study',
      'family-partner',
      'visitor',
      'business-investment',
      'not-sure',
    ])
    .optional(),
  ageBracket: z.enum(['under-25', '25-32', '33-39', '40-44', '45-plus']).optional(),

  // Shared skilled/study attributes (reused across work / permanent / study).
  qualification: z
    .enum(['none', 'certificate', 'diploma', 'bachelor', 'masters', 'doctorate'])
    .optional(),
  skilledExperienceYears: z.enum(['0', '1-2', '3-4', '5-7', '8-plus']).optional(),
  currentOccupation: shortText,
  intendedOccupation: shortText,
  qualificationRelated: yesNoUnsure.optional(),

  // Reusable conditional: English test → type → score.
  englishTest: yesNoUnsure.optional(),
  englishTestType: z.enum(['ielts', 'pte', 'toefl', 'oet', 'other']).optional(),
  englishScore: tinyText,

  // Reusable conditional: skills assessment → assessing authority.
  skillsAssessment: yesNoUnsure.optional(),
  skillsAssessmentAuthority: shortText,

  // Reusable conditional: job offer → employer/role details.
  jobOffer: yesNo.optional(),
  jobOfferDetails: shortText,

  // Reusable conditional: Australian work experience → occupation → duration.
  ausExperience: yesNo.optional(),
  ausExperienceOccupation: shortText,
  ausExperienceDuration: tinyText,

  // Reusable conditional: Australian study → course → duration.
  ausStudy: yesNo.optional(),
  ausStudyCourse: shortText,
  ausStudyDuration: tinyText,

  // Study pathway.
  studyField: shortText,
  chosenCourse: yesNoUnsure.optional(),

  // Partner pathway.
  partnerStatus: z.enum(['citizen', 'permanent-resident', 'not-sure']).optional(),
  relationshipType: z.enum(['married', 'de-facto', 'engaged', 'other']).optional(),
  timeTogether: z.enum(['under-1', '1-2', '2-3', '3-plus']).optional(),
  livedTogether: yesNo.optional(),
  priorPartnerVisa: yesNo.optional(),

  // Existing-visa pathway.
  currentVisaExpiry: tinyText,
  whatNext: z.enum(['study', 'work', 'permanent', 'partner', 'stay', 'not-sure']).optional(),

  // Refusal / cancellation pathway.
  refusedVisaType: shortText,
  refusedOrCancelled: z.enum(['refused', 'cancelled', 'not-sure']).optional(),
  refusalWhen: tinyText,
  refusalReason: z.string().trim().max(2000).optional(),
  currentStatus: shortText,
  priorRefusal: yesNoUnsure.optional(),

  // General refusal flag (asked on partner / existing-visa / other paths). Optional now.
  everRefusedOrCancelled: yesNoUnsure.optional(),

  // Contact (always collected on the final step).
  firstName,
  email,
  mobile: phone.optional(),
  preferredContact: z.enum(['email', 'phone', 'whatsapp']).default('email'),
  sensitiveInfoAcknowledged: z.boolean().default(false),

  // Attribution captured client-side (UTM + referrer + landing page + device).
  attribution: attribution.optional(),
});
export type HealthCheckSubmission = z.infer<typeof healthCheckSubmission>;
