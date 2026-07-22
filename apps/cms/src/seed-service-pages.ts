/**
 * Seed the 14 "Our Services" pages, VERBATIM from the authoritative source document
 * (VMD-Service-Pages-FINAL-SEO). Every heading, paragraph, bullet, FAQ, CTA line,
 * related label and disclaimer is copied exactly as written — nothing is rewritten,
 * summarised or reworded. Body markdown is converted to Payload Lexical; bracket
 * placeholders ([Book a consultation], [Check your eligibility], related labels) are
 * preserved as literal text and wired to links by the frontend, not by editing copy.
 *
 * URLs are the document's exact slugs: /visas/…, /services/…, /initial-consultation.
 *
 * Run: `pnpm --filter @vmd/cms seed:service-pages` (needs DATABASE_URL).
 */
import { getPayload } from 'payload';
import type { Payload } from 'payload';
import config from '../payload.config.ts';
import type { ServicePage } from './payload-types.ts';
import { mdToLexical } from './lib/mdToLexical.ts';

type Section = 'visas' | 'services' | 'root';
interface PageSeed {
  section: Section;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  body: string;
  faq: { question: string; answer: string }[];
  cta: { heading: string; body: string; buttonHref?: string };
  related: string[];
  disclaimer: string;
}

const STD_DISCLAIMER =
  'Immigration assistance is provided by Sunil Uprety, Registered Migration Agent (MARN: 2318234). Information on this page is general in nature and current at the time of publishing. Requirements, processing times and government policy can change — contact us to confirm the requirements currently in force and any current pricing before you act. This information does not constitute immigration assistance or legal advice. Eligibility depends on your individual circumstances. Last reviewed: July 2026.';

const CTA_HEADING = 'Ready to get started?';

const PAGES: PageSeed[] = [
  {
    section: 'visas',
    slug: 'subclass-485-temporary-graduate-visa',
    title: 'Subclass 485 Temporary Graduate Visa',
    metaTitle: 'Subclass 485 Temporary Graduate Visa | Visa & Migration Doctors',
    metaDescription:
      'Recently graduated in Australia? The Subclass 485 visa lets eligible graduates live and work here temporarily. Perth-based Registered Migration Agent — clear advice, well-prepared applications.',
    body: `Finished a degree in Australia and not ready to leave? The Subclass 485 Temporary Graduate visa lets eligible recent international graduates stay, live and work in Australia temporarily — a valuable bridge while you gain experience or plan your next step toward permanent residence. We help you work out which stream fits your situation and prepare a well-organised application.

## Who this visa is for (Post-Higher Education Work stream)

When you lodge, you generally need to:

- Hold an eligible student visa, or have held one within the last 6 months
- Meet the qualification and age requirements below
- Have the required level of English
- Hold adequate health insurance for your stay
- Meet the health and character requirements

**Qualification and age requirements**

- **Bachelor's or master's (coursework or extended) graduates:** completed within the last 6 months, after at least 2 academic years of study in Australia, and aged 35 years or under at the time of application.
- **Master's (research) or doctoral graduates:** completed within the last 6 months, after at least 2 academic years of study in Australia, with a higher age limit (under 50 — that is, 49 years of age or under).

A graduate diploma may also qualify in some cases where it follows on from an eligible qualification in a related field. Age and qualification settings have changed in recent years — we confirm the requirements currently in force before you apply.

## How long the visa lasts

Visa periods depend on your qualification — generally up to two years for a bachelor's or master's by coursework, and up to three years for a master's by research or a doctorate. Longer periods apply to some graduates under specific arrangements, including eligible Indian nationals in certain fields. We confirm the term that applies to you.

## The second (regional) Subclass 485

If your first Subclass 485 was connected to study in a designated regional area, and while holding it you lived, worked and studied only in designated regional areas for the required period, you may be eligible for a *second* Subclass 485 — giving you further time in regional Australia. The criteria are specific, so we assess whether your regional study and residence qualify you for this pathway.

## How the application works

Before lodging, there are steps to prepare — from confirming your English results and health cover to obtaining an Australian Federal Police clearance. We guide you through each stage, review your documents, and lodge a complete application on your behalf. You must generally be in Australia when the application is lodged.`,
    faq: [
      {
        question: 'Can I work full-time on a Subclass 485 visa?',
        answer:
          "Yes — the 485 generally comes with unrestricted work rights for its duration, which is why it's such a valuable bridge toward skilled or employer-sponsored pathways.",
      },
      {
        question: 'Can I include my family in the application?',
        answer:
          'Generally yes — your partner and dependent children can usually be included as family applicants, or added in certain circumstances. We confirm what applies to your family.',
      },
      {
        question: 'Can I get a second 485 visa?',
        answer:
          "Only through the regional pathway — where your first 485 was connected to regional study and you've lived, worked and studied in designated regional areas for the required period. Outside that, the 485 is generally a once-only visa, which makes using its time strategically essential.",
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist graduates across Australia. **[Book a consultation]** and we'll assess your eligibility and map out your options — or **[Check your eligibility]** to begin.",
    },
    related: [
      'Subclass 500 Student Visa',
      'Subclass 189 Skilled Independent Visa',
      'Skills Assessment',
    ],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'subclass-189-skilled-independent-visa',
    title: 'Subclass 189 Skilled Independent Visa (Points-tested stream)',
    metaTitle: 'Subclass 189 Skilled Independent Visa | Visa & Migration Doctors',
    metaDescription:
      'The Subclass 189 visa offers permanent residence to skilled workers without sponsorship. Points test, skills assessment and EOI — prepared properly by a Perth Registered Migration Agent.',
    body: `The Subclass 189 Skilled Independent visa offers permanent residence to skilled workers who aren't sponsored by an employer, a state or territory, or a family member. It's an invitation-based visa, so a positive skills assessment, a competitive points score, and an accurate, well-prepared Expression of Interest all matter. We help you present your profile accurately and at its strongest at every step.

## Who this visa is for

At the time you're invited to apply, you generally need to:

- Be under 45 years of age
- Nominate an occupation on the applicable skilled occupation list for this visa
- Have a suitable skills assessment from the relevant assessing authority for that occupation
- Have at least competent English
- Score at least 65 on the points test (based on age, English, qualifications, experience and other factors)

## How the application works

1. **Eligibility assessment.** We review your occupation options, qualifications, experience and English to gauge whether you're likely to meet the requirements.
2. **Skills assessment.** We prepare and lodge your application with the correct assessing authority for your occupation.
3. **Expression of Interest (EOI).** Once your skills assessment is positive, we prepare and lodge your EOI, which ranks you against other candidates.
4. **Visa application.** If you're invited to apply, we lodge a complete application within the required timeframe, with all supporting documents.

Because invitations depend on your points ranking and Australia's skill needs at the time, an invitation isn't guaranteed — our role is to ensure your claims are accurate, fully evidenced, and presented at their genuine best.`,
    faq: [
      {
        question: 'Is 65 points enough to be invited?',
        answer:
          '65 is the minimum to lodge an Expression of Interest, but invitations are competitive and often go to higher-scoring candidates depending on the occupation and the round. We assess your realistic position honestly — including whether the 190 or 491 would serve you better.',
      },
      {
        question: 'Do I need a job offer for the 189?',
        answer:
          'No — the 189 requires no employer, state or family sponsorship. That independence is its main appeal, and also why competition for invitations is strong.',
      },
      {
        question: 'Can my family be included?',
        answer:
          "Generally yes — your partner and dependent children can usually be included in the application, and a partner's own skills or English can sometimes add points.",
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist skilled applicants Australia-wide and offshore. **[Check your eligibility]** or **[Book a consultation]** and we'll assess your occupation options and points position.",
    },
    related: [
      'Skills Assessment',
      'Subclass 190 Skilled Nominated Visa',
      'Subclass 491 Skilled Work Regional Visa',
    ],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'subclass-190-skilled-nominated-visa',
    title: 'Subclass 190 Skilled Nominated Visa',
    metaTitle: 'Subclass 190 Skilled Nominated Visa | Visa & Migration Doctors',
    metaDescription:
      'The Subclass 190 visa gives permanent residence to skilled workers nominated by a state or territory. Understand the criteria and nomination strategy — Perth Registered Migration Agent.',
    body: `The Subclass 190 Skilled Nominated visa gives permanent residence to skilled workers nominated by an Australian state or territory. If your occupation is in demand where you plan to settle, this can be a strong pathway. We help you identify the states where your profile is most competitive, prepare the evidence their criteria require, and lodge a complete application.

## Who this visa is for

At the time you're invited to apply, you generally need to:

- Be under 45 years of age
- Nominate an occupation on the applicable skilled occupation lists for this visa
- Have a suitable skills assessment from the relevant assessing authority
- Have at least competent English
- Score at least 65 on the points test
- Be nominated by an Australian state or territory government

## How the application works

1. **Eligibility assessment.** We review your occupation, skills, experience and English, and consider which states best fit your profile.
2. **Skills assessment.** We lodge your application with the correct assessing authority.
3. **Expression of Interest.** We prepare your EOI and record your preferred state or territory (or make you available to all).
4. **State/territory nomination.** We prepare the evidence each state requires. Criteria vary by state, change over time, and generally include a commitment to settle in that state for at least two years. Nomination decisions rest entirely with the state or territory.
5. **Visa application.** If nominated and invited, we lodge your complete application within the required timeframe.

State criteria and occupation lists change regularly, and nomination isn't guaranteed — our role is to position your application where it is genuinely most competitive and to present it properly.`,
    faq: [
      {
        question: 'Which state should I apply to?',
        answer:
          'The state where your occupation is in demand and your profile best fits the current criteria — which changes through the year as programs open, close and adjust. Living in Western Australia can strengthen a WA nomination case, but we assess all states against your circumstances.',
      },
      {
        question: 'Do I have to live in the nominating state?',
        answer:
          'States generally expect a genuine commitment to settle there — commonly for at least two years. Nominations are made on that basis, and we advise you to treat the commitment seriously.',
      },
      {
        question: 'Is nomination guaranteed if I meet the criteria?',
        answer:
          "No — meeting the published criteria makes you eligible to apply, but nomination is at the state's discretion and depends on demand, quotas and competition at the time.",
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist applicants Australia-wide. **[Check your eligibility]** or **[Book a consultation]** to explore state nomination options.",
    },
    related: [
      'Subclass 189 Skilled Independent Visa',
      'Subclass 491 Skilled Work Regional Visa',
      'Skills Assessment',
    ],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'subclass-491-skilled-work-regional-visa',
    title: 'Subclass 491 Skilled Work Regional (Provisional) Visa',
    metaTitle: 'Subclass 491 Skilled Work Regional (Provisional) Visa | Visa & Migration Doctors',
    metaDescription:
      'The Subclass 491 visa lets skilled workers live and work in regional Australia for up to 5 years, with a pathway to PR via the 191. Perth-based Registered Migration Agent.',
    body: `The Subclass 491 visa lets invited skilled workers live and work in designated regional areas of Australia for up to five years — and it opens a pathway to permanent residence through the Subclass 191 visa. Nomination decisions are made by states and territories, and sponsorship eligibility is set by law — what we do is prepare your Expression of Interest, nomination evidence and visa application so your case is presented accurately and at its strongest.

## Who this visa is for

At the time you're invited to apply, you generally need to:

- Be under 45 years of age
- Nominate an occupation on the applicable skilled occupation lists for this visa
- Have a suitable skills assessment for your nominated occupation (an assessment obtained for a Subclass 485 application is not valid here)
- Have at least competent English (a higher level may be needed for some occupations)
- Score at least 65 on the points test
- Be nominated by a state or territory government, **or** be sponsored by an eligible relative living in a designated regional area

## How the application works

We start with an eligibility assessment, prepare your skills assessment, then lodge your Expression of Interest. If you're seeking state nomination, we prepare the evidence the state requires; if you're relying on family sponsorship, we confirm your relative meets the sponsorship criteria. Once you're invited, we lodge your complete visa application within the required timeframe.

## Living in regional Australia and next steps

As a 491 holder you must live, work and study only in designated regional areas, and keep the Department updated on your circumstances. After holding the visa for at least three years and meeting the requirements in force — including regional residence and compliance with your visa conditions — you may become eligible for the permanent Subclass 191 visa.`,
    faq: [
      {
        question: 'What counts as a designated regional area?',
        answer:
          'Broadly, everywhere in Australia except the Sydney, Melbourne and Brisbane metropolitan areas — which includes all of Western Australia, Perth included. The designated areas are set by legislative instrument, so we confirm the current boundaries for your plans.',
      },
      {
        question: 'Can I move between regional areas?',
        answer:
          'Generally yes — the condition is that you live, work and study in *designated regional areas*, not one fixed location. Keeping the Department updated on your address and circumstances is part of the visa.',
      },
      {
        question: 'When can I apply for permanent residence?',
        answer:
          'Through the Subclass 191, generally after holding your 491 for at least three years and meeting the requirements in force at that time — including compliance with your regional conditions.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD — inside a designated regional area ourselves — and assist applicants Australia-wide. **[Check your eligibility]** or **[Book a consultation]** to explore your regional options.",
    },
    related: [
      'Subclass 191 Permanent Residence (Skilled Regional) Visa',
      'Skills Assessment',
      'Subclass 190 Skilled Nominated Visa',
    ],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'subclass-191-permanent-residence-skilled-regional-visa',
    title: 'Subclass 191 Permanent Residence (Skilled Regional) Visa',
    metaTitle:
      'Subclass 191 Permanent Residence (Skilled Regional) Visa | Visa & Migration Doctors',
    metaDescription:
      'Held a 491 or 494 visa for 3 years? The Subclass 191 offers permanent residence. Current requirements explained by a Perth Registered Migration Agent.',
    body: `The Subclass 191 visa is the permanent-residence step for skilled migrants who have built their lives in regional Australia. If you've held an eligible regional visa and met its conditions, this is your pathway to becoming a permanent resident. We help you evidence your regional residence and compliance, and lodge a complete application.

## Who this visa is for

To qualify, you generally need to:

- Have held a Subclass 491 or Subclass 494 provisional visa for at least three years
- Have substantially complied with your visa conditions, including living, working and studying only in designated regional areas
- Meet any income or evidentiary requirements in force at the time of your application — these settings have been the subject of change, and we confirm exactly what applies to you before you lodge
- Meet the health and character requirements

## How the application works

We begin with an eligibility assessment — reviewing your visa conditions, your regional residence and employment, and your supporting evidence — then prepare and lodge your application with the Department. You may generally be in or outside Australia when you apply and when the visa is granted.`,
    faq: [
      {
        question: 'Do my family members get permanent residence too?',
        answer:
          "Generally yes — members of your family unit can be included through a combined application, and they don't need to hold a 491 or 494 themselves. Each family member must meet health and character requirements and have substantially complied with the conditions of any visas they have held.",
      },
      {
        question: 'What if my work situation changed during my 491?',
        answer:
          "What matters is substantial compliance with your visa conditions across the period. Changes in employment aren't automatically a problem — but they should be assessed properly before you lodge, which is exactly what the diagnosis stage is for.",
      },
      {
        question: 'Can I apply from outside Australia?',
        answer:
          'Generally yes — you may be in or outside Australia both when you apply and when the visa is granted. We confirm the settings that apply at your time of application.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist regional visa holders across Australia. **[Check your eligibility]** or **[Book a consultation]** to confirm you're ready for permanent residence.",
    },
    related: ['Subclass 491 Skilled Work Regional Visa'],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'subclass-186-employer-nomination-scheme-visa',
    title: 'Subclass 186 Employer Nomination Scheme (ENS) Visa',
    metaTitle: 'Subclass 186 Employer Nomination Scheme (ENS) Visa | Visa & Migration Doctors',
    metaDescription:
      'The Subclass 186 ENS visa lets employers sponsor skilled workers for permanent residence. Direct Entry and TRT streams explained — Perth Registered Migration Agent.',
    body: `The Subclass 186 Employer Nomination Scheme visa gives Australian employers a pathway to employ skilled workers permanently — and gives skilled workers a direct route to permanent residence. There are two streams, and we help both employers and applicants prepare nomination and visa applications that stand up to scrutiny.

## What the employer and position must meet

For either stream, the sponsoring business must generally be actively and lawfully operating, financially able to employ you in the nominated position for at least two years, and free of adverse information. The position must be genuine and full-time, available for at least two years, with a salary that meets the required minimum and the annual market salary rate for the role. Employers also pay the Skilling Australians Fund levy for each nomination.

## Direct Entry stream

The Direct Entry stream suits skilled workers who haven't necessarily worked in Australia on a sponsored visa. As the applicant you generally need to be under 45, hold a suitable skills assessment, have at least three years of relevant work experience, have at least competent English, and nominate an occupation on the applicable occupation list (currently the Core Skills Occupation List).

## Temporary Residence Transition stream

The Temporary Residence Transition stream suits workers already sponsored in Australia. As the applicant you generally need to have held an eligible Subclass 482 (or earlier 457) visa and worked full-time in your nominated occupation for at least two of the last three years, be under 45, and have at least competent English. A formal skills assessment usually isn't required for this stream.

## How the application works

The employer's **nomination** is lodged with the Department for the skilled position, and your **visa application** is lodged either at the same time or within the required period after the nomination is approved. Once both are approved, you're granted a permanent visa. We coordinate both sides so the applications align and are properly evidenced.`,
    faq: [
      {
        question: 'Is there an age limit for the 186?',
        answer:
          'Generally yes — under 45 at the time of application for both streams, with limited exemptions for certain applicants. We confirm whether an exemption could apply to you.',
      },
      {
        question: 'Do I need a skills assessment?',
        answer:
          'For the Direct Entry stream, generally yes. For the Temporary Residence Transition stream, usually not — your sponsored work history in the occupation does that work instead.',
      },
      {
        question: 'What does the employer have to pay?',
        answer:
          'The employer pays the Skilling Australians Fund levy and their own nomination costs, and sponsorship and recruitment costs cannot be passed on to the visa applicant.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist employers and applicants Australia-wide. **[Book a consultation]** or **[Check your eligibility]** and we'll map out the right stream.",
    },
    related: ['Subclass 482 Skills in Demand Visa', 'Skills Assessment'],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'subclass-482-skills-in-demand-visa',
    title: 'Subclass 482 Skills in Demand Visa',
    metaTitle: 'Subclass 482 Skills in Demand Visa | Visa & Migration Doctors',
    metaDescription:
      'The Subclass 482 Skills in Demand visa lets employers sponsor skilled workers for up to 4 years, with pathways to PR. Requirements explained — Perth Registered Migration Agent.',
    body: `The Subclass 482 Skills in Demand visa gives Australian employers a way to sponsor skilled overseas workers for up to four years — and can open a longer-term pathway to permanent residence. We guide employers and workers through sponsorship, nomination and the visa application so each stage is complete and compliant.

## What the employer and position must meet

The sponsoring business must generally be actively and lawfully operating, financially capable of employing you and paying the nominated salary for the visa period, and free of adverse information. The position must be genuine and full-time, pay at least the required minimum salary and the annual market salary rate, and be on the applicable occupation list (currently the Core Skills Occupation List). In most cases the employer must also complete Labour Market Testing — advertising the role for the required period to test for suitable Australian candidates.

Approved sponsors take on obligations designed to protect overseas workers, including not passing sponsorship or recruitment costs on to you.

## Who this visa is for

As the applicant, you generally need to:

- Genuinely intend to work in the nominated position
- Have skills, qualifications and/or experience matching the role (a skills assessment may be required)
- Have at least one year of relevant full-time work experience (or equivalent) in the last five years
- Meet any licensing or registration requirements
- Have at least vocational English
- Hold adequate health insurance and meet the health and character requirements

## How the application works

There are three stages: the employer's **sponsorship** application, the **nomination** of your position, and your **visa** application. These can often be lodged together. Once all three are approved, your visa is granted for a period of up to four years, depending on the role. We coordinate the whole process so the timing and evidence line up.`,
    faq: [
      {
        question: 'Can the 482 lead to permanent residence?',
        answer:
          'Generally yes — most commonly through the Subclass 186 Temporary Residence Transition stream after the required period of sponsored work, and we plan that pathway from the start rather than leaving it to chance.',
      },
      {
        question: 'Can I change employers on a 482?',
        answer:
          'Not freely — your visa is tied to your nominated position, and a new employer generally needs an approved nomination before you start working for them. If your employment ends, strict timeframes apply, so get advice immediately.',
      },
      {
        question: 'Whose job is Labour Market Testing?',
        answer:
          "The employer's — in most cases the role must be advertised as required before nomination. We manage the evidence so the nomination isn't undone by a technicality.",
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist sponsoring employers and applicants Australia-wide. **[Book a consultation]** or **[Check your eligibility]** to begin.",
    },
    related: ['Subclass 186 Employer Nomination Scheme Visa', 'Skills Assessment'],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'partner-visa-onshore-820-801',
    title: 'Partner Visa (Onshore) — Subclass 820/801',
    metaTitle: 'Partner Visa Onshore (820/801) | Visa & Migration Doctors Perth',
    metaDescription:
      'The onshore Partner visa (820/801) lets the partner of an Australian live in Australia, leading to PR. Evidence done properly — Perth Registered Migration Agent.',
    body: `If you're the spouse or de facto partner of an Australian citizen, permanent resident, or eligible New Zealand citizen and you're in Australia, the onshore Partner visa lets you stay and build your life together. It's a two-stage visa — a temporary Subclass 820 followed by the permanent Subclass 801 — and strong, well-organised relationship evidence makes a real difference. We help you put it together.

## Who this visa is for

You generally need to show that:

- You're married to, or in a genuine de facto relationship (usually of at least 12 months) with, an eligible partner
- You and your partner are in a mutually exclusive, genuine and continuing relationship, and live together or apart only temporarily
- Your sponsor meets the sponsorship requirements, including police clearances and sponsorship-history limits
- You meet the health and character requirements

You must generally be in Australia when the application is lodged. If you're unlawfully in Australia, additional requirements apply — talk to us early.

## How the two stages work

**Stage 1 (Subclass 820).** We lodge your combined application with the Department. You and your partner may be asked to attend an interview or provide further relationship checks. If successful, you're granted the temporary 820 visa, letting you remain in Australia while the permanent stage is decided.

**Stage 2 (Subclass 801).** Around two years after lodging the combined application, you become eligible to submit the second-stage (801) application with updated evidence of your ongoing relationship. This is a formal submission, not an automatic step — we diarise the date, prepare the updated evidence, and lodge the second stage for you.`,
    faq: [
      {
        question: 'Can I work while the application is processing?',
        answer:
          'Generally yes — lodging a valid onshore application usually gives you a bridging visa when your current visa ends, and these commonly carry work rights. We confirm your specific situation.',
      },
      {
        question: 'What relationship evidence do we need?',
        answer:
          'Evidence across four areas: finances, household, social recognition of the relationship, and your commitment to each other — told consistently across documents and statements. Building that file well is most of the work.',
      },
      {
        question: "We've been together less than 12 months — can we still apply?",
        answer:
          'Possibly — the 12-month de facto requirement has exceptions, including registered relationships in some states and territories, and marriage removes it entirely. We assess which route fits.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist couples across Australia. **[Book a consultation]** and we'll help you build a well-evidenced partner application.",
    },
    related: ['Partner Visa (Offshore) 309/100'],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'partner-visa-offshore-309-100',
    title: 'Partner Visa (Offshore) — Subclass 309/100',
    metaTitle: 'Partner Visa Offshore (309/100) | Visa & Migration Doctors Perth',
    metaDescription:
      'The offshore Partner visa (309/100) lets the partner of an Australian enter and settle in Australia. Well-evidenced applications — Perth Registered Migration Agent.',
    body: `If you're the spouse or de facto partner of an Australian citizen, permanent resident, or eligible New Zealand citizen and you're outside Australia, the offshore Partner visa lets you enter and remain in Australia with your partner. It begins with the provisional Subclass 309 visa and leads to permanent residence. We help you assemble the relationship evidence that gives your application its proper footing.

## Who this visa is for

You generally need to show that:

- You're married to your partner, intend to marry before the visa is decided, or have been in a genuine de facto relationship (usually of at least 12 months)
- You and your partner are in a mutually exclusive, genuine and continuing relationship, and live together or apart only temporarily
- Your sponsor meets the sponsorship requirements, including police clearances and sponsorship-history limits
- You meet the health and character requirements

You must generally be outside Australia when the application is lodged.

## How it works and next steps

We lodge your application with the Department on behalf of you and your sponsor. You may be asked to attend an interview or provide further checks. If successful, you're first granted the provisional Subclass 309 visa. Around two years after lodging, provided your relationship continues, you become eligible to submit the second-stage (Subclass 100) application with updated relationship evidence — a formal step we prepare and lodge for you.`,
    faq: [
      {
        question: 'Can I visit Australia while the application is processing?',
        answer:
          'Often yes, on another visa such as a visitor visa — though your location at certain stages of processing matters. We plan your travel around the application, not the other way round.',
      },
      {
        question: "What if we're engaged but not yet married?",
        answer:
          'The Prospective Marriage (Subclass 300) visa may suit — it lets you enter Australia to marry your partner, then apply for the partner visa onshore. We advise which sequence is right for your situation and budget.',
      },
      {
        question: 'Does evidence matter as much as for the onshore visa?',
        answer:
          'Yes — the relationship test is the same. Distance can make evidence-gathering harder, which is exactly why it should be planned deliberately from the start.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and regularly assist couples with partners offshore. **[Book a consultation]** and we'll help you present a well-documented relationship case.",
    },
    related: ['Partner Visa (Onshore) 820/801'],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'subclass-500-student-visa',
    title: 'Subclass 500 Student Visa',
    metaTitle: 'Subclass 500 Student Visa | Visa & Migration Doctors Perth',
    metaDescription:
      'The Subclass 500 Student visa lets international students study full-time in Australia. Enrolment, funds, English and the Genuine Student requirement — Perth migration agent.',
    body: `The Subclass 500 Student visa lets international students study full-time in Australia for the length of their course. Getting the application right — especially your enrolment, funds and genuine study intentions — matters, and we help you present a clear, well-supported application.

## Who this visa is for

As the applicant, you generally need to:

- Be enrolled full-time with an Australian education provider and hold a Confirmation of Enrolment
- Genuinely intend to complete your studies in Australia
- Have the required level of English (unless exempt)
- Hold Overseas Student Health Cover for your stay
- Have access to sufficient funds for travel, tuition and living costs (including for any dependants)

Documentary requirements can vary with the assessment level attached to your application, which depends on factors including your education provider and nationality.

## How the application works

Once you're enrolled and have your Confirmation of Enrolment, we prepare and lodge your visa application with the Department, tailored to your circumstances. After your visa is granted, you can generally work up to 48 hours per fortnight while your course is in session, with unrestricted hours during scheduled course breaks (different arrangements apply to some research degrees).`,
    faq: [
      {
        question: 'How many hours can I work on a student visa?',
        answer:
          'Generally up to 48 hours per fortnight while your course is in session, and unrestricted hours during scheduled breaks. Different arrangements apply to some research students.',
      },
      {
        question: 'What is the Genuine Student requirement?',
        answer:
          "An assessment of whether you genuinely intend to study in Australia — looking at your circumstances, course choice, history and future plans. It's decided largely on your written material, so credibility and consistency across your application are everything.",
      },
      {
        question: 'Can my family come with me?',
        answer:
          'Eligible family members can generally be included or added as dependants, with their own health cover and funds requirements. We advise what applies to your family and course level.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist students onshore and offshore. **[Book a consultation]** and we'll help you lodge a well-prepared student visa application.",
    },
    related: ['Subclass 485 Temporary Graduate Visa', 'ART Review Applications'],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'visas',
    slug: 'subclass-600-visitor-visa',
    title: 'Subclass 600 Visitor Visa (Tourist Stream)',
    metaTitle: 'Subclass 600 Visitor Visa | Visa & Migration Doctors Perth',
    metaDescription:
      'The Subclass 600 Visitor visa lets you travel to Australia for tourism or to visit family. Requirements and longer parent-stay options — Perth Registered Migration Agent.',
    body: `The Subclass 600 Visitor visa (Tourist stream) lets you travel to Australia for a holiday or to visit family and friends. Whether it's a single trip or regular visits, we help you put forward a clear, well-supported application.

## Who this visa is for

As the applicant, you generally need to:

- Genuinely intend to visit for tourism or to see family and friends (not for work or medical treatment)
- Have access to sufficient funds for your stay
- Meet the health and character requirements (health insurance may be required)

## Visa validity and conditions

Depending on your circumstances, you may be granted a single-entry or multiple-entry visa. As a visitor you generally can't work in Australia, and can't study for more than three months. Parents of Australian citizens or permanent residents may be considered for longer visitor arrangements in some cases, assessed case by case — we can advise whether this suits your family's situation.

## How the application works

Once you've provided your information and supporting documents, we prepare and lodge your application with the Department. Where you are when you apply can affect where you must be when the visa is granted — we'll explain how this applies to you.`,
    faq: [
      {
        question: 'How long can I stay on a visitor visa?',
        answer:
          'Stay periods are set at grant — commonly three, six or twelve months — based on your purpose and circumstances. Longer arrangements may be considered for parents of Australians.',
      },
      {
        question: 'Can I extend my stay from inside Australia?',
        answer:
          'Sometimes a further visa can be applied for onshore — but some visitor visas carry a "no further stay" condition that prevents this. Check your grant conditions before making plans; we can advise on your options.',
      },
      {
        question: 'Can I study or work as a visitor?',
        answer:
          "No work, and study only up to three months. If study or work is the real purpose, the right visa — not a workaround — is the answer, and we'll point you to it.",
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist visitors and their Australian families. **[Book a consultation]** and we'll help you prepare a well-supported application.",
    },
    related: ['Subclass 500 Student Visa', 'Partner Visa (Offshore) 309/100'],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'services',
    slug: 'skills-assessment',
    title: 'Skills Assessment',
    metaTitle: 'Skills Assessment for Australian Skilled Visas | Visa & Migration Doctors',
    metaDescription:
      "Most skilled visas require a positive skills assessment from the right authority. What's involved and how to get it right first time — Perth Registered Migration Agent.",
    body: `A skills assessment is a key step for most skilled visas — it confirms your qualifications and experience match your nominated occupation. Only an assessment from the assessing authority specified for your occupation will be accepted, so getting it right the first time matters. We identify the correct authority and prepare a thorough application.

## When you need one

A skills assessment is generally required for the Subclass 189, 190, 491 and 494 visas, for the Subclass 485 Post-Vocational Education Work stream, and for the Subclass 186 Direct Entry stream unless an exemption applies. Some Subclass 482 applicants also need one.

## What's involved

As a minimum, you'll usually need to provide evidence of your identity, qualifications, work experience, and any registration or licensing. The assessing authority may also verify your history directly with your education providers and employers, so all information — including referees and publicly visible details — should be accurate and up to date. Some assessing authorities also set their own English language requirements for certain occupations, separate from the visa's — we confirm what your occupation's authority requires.

## How the application works

We start with an eligibility review once your occupation and assessing authority are identified, then prepare and lodge your application and respond to any requests for information. A positive assessment letter is generally valid for a limited period for migration purposes — commonly three years, unless the authority specifies otherwise.`,
    faq: [
      {
        question: 'Which assessing authority do I use?',
        answer:
          "It depends entirely on your nominated occupation — each occupation has a specified authority, and only that authority's assessment counts. Identifying it correctly is step one of every skilled matter.",
      },
      {
        question: 'How long is a skills assessment valid?',
        answer:
          "Generally up to three years for migration purposes, unless the authority's letter specifies a shorter period. Timing your assessment against your EOI and visa strategy matters.",
      },
      {
        question: 'What if my assessment comes back negative?',
        answer:
          'Many authorities offer review or appeal processes, and sometimes a reapplication with better evidence — or a different occupation — is the smarter route. Get advice before accepting a negative outcome as final.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and assist applicants in every skilled occupation. **[Book a consultation]** and we'll identify the right assessing authority for your occupation.",
    },
    related: [
      'Subclass 189 Skilled Independent Visa',
      'Subclass 485 Temporary Graduate Visa',
      'Subclass 186 ENS Visa',
    ],
    disclaimer: STD_DISCLAIMER,
  },

  {
    section: 'services',
    slug: 'art-review-applications',
    title: 'ART (Administrative Review Tribunal) Review Applications',
    metaTitle:
      'ART Review Applications — Visa Refused or Cancelled | Visa & Migration Doctors Perth',
    metaDescription:
      'Visa refused or cancelled? The Administrative Review Tribunal can review the decision — but deadlines are strict. Act today. Perth Registered Migration Agent.',
    body: `If the Department of Home Affairs has refused or cancelled your visa, the Administrative Review Tribunal (ART) can review that decision on its merits — and may affirm it, set it aside, or send it back to the Department for reconsideration. The deadlines are strict, so acting quickly is essential. We help you lodge on time and present your case as strongly as the facts allow.

## Act quickly — the deadlines are strict

Your review application must generally be lodged within the timeframe stated in your decision letter — often 28 days for a refusal, and much shorter for cancellations (sometimes only days). These deadlines generally cannot be extended, so treat the date in your letter as final and contact us as soon as possible — for cancellations, that can genuinely mean within days.

**If you believe you've missed the deadline, contact us anyway.** Whether you were validly notified of the decision — and therefore when your time actually started running — can itself be a live legal question, and it deserves proper assessment before you assume the door is closed.

## How the process works

1. **Lodgement.** We lodge your review application with the ART within the required timeframe. Depending on your circumstances, an existing bridging visa may continue while the review runs, or you may need to apply for one to remain lawful — we confirm your position as part of taking on the matter.
2. **Submissions.** While your application is in the queue, we gather your supporting evidence and prepare written submissions. Some matters — including many student visa refusals — are decided on the papers, which makes the written case especially important.
3. **Review and hearing.** The ART considers the material and may hold a hearing, where we assist you to make submissions and answer its questions before it decides.`,
    faq: [
      {
        question: 'Can I stay in Australia during the review?',
        answer:
          'In many cases yes — lodging a valid review application is often associated with a bridging visa that keeps you lawful while the ART decides. We confirm your position when we assess the matter.',
      },
      {
        question: 'Can I give the ART new evidence?',
        answer:
          'Yes — merits review means the Tribunal looks at your case afresh and can consider material the Department never saw. A review done properly is a rebuilt case, not a resubmitted one.',
      },
      {
        question: 'How long does an ART review take?',
        answer:
          'It varies significantly with the caseload and the type of matter — often many months. We advise on realistic expectations for your matter type and use the waiting time to strengthen the case.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "We're based in Perth CBD and act in review matters Australia-wide. If your visa has been refused or cancelled, **[Book a consultation]** now — timing is critical.",
    },
    related: ['Initial Consultation', 'Subclass 500 Student Visa'],
    disclaimer:
      'Immigration assistance is provided by Sunil Uprety, Registered Migration Agent (MARN: 2318234). Information on this page is general in nature and current at the time of publishing. Requirements, processing times and government policy can change — contact us to confirm the requirements currently in force and any current pricing before you act. This information does not constitute immigration assistance or legal advice. Review rights and timeframes depend on your specific decision. Last reviewed: July 2026.',
  },

  {
    section: 'root',
    slug: 'initial-consultation',
    title: 'Initial Consultation',
    metaTitle: 'Book a Migration Agent Consultation in Perth | Visa & Migration Doctors',
    metaDescription:
      'Not sure which visa is right for you? Book an initial consultation with Perth Registered Migration Agent Sunil Uprety (MARN 2318234) — honest advice on your options.',
    body: `Not sure where to start? An initial consultation with our principal, Sunil Uprety, Registered Migration Agent (MARN: 2318234), is the first step for most people. It's your chance to talk through your situation and get clear, honest guidance on your options before you commit to anything.

## What to expect

During your consultation, you can expect:

- Preliminary advice on your potential migration options, based on the information you share
- An outline of the requirements and the process for those options
- An estimate of the likely costs involved
- Guidance on whether we can assist you

The consultation is about identifying your options — it isn't a full eligibility assessment or detailed migration assistance. If you'd like us to take your matter further, we'll invite you to formally engage our services under a written agreement, as required by law.

## Honest, professional advice

As a Registered Migration Agent, Sunil Uprety is bound by the Migration Agents Code of Conduct and the standards administered by the Office of the Migration Agents Registration Authority (OMARA). That includes being honest with you about your prospects, giving accurate advice, keeping your information confidential and secure, and acting in accordance with the law.`,
    faq: [
      {
        question: 'What should I bring to the consultation?',
        answer:
          'Your passport, your visa history, any decision or refusal letters, and your qualification and work documents. The more complete the picture, the more precise the guidance.',
      },
      {
        question: 'Is the consultation confidential?',
        answer:
          'Yes — confidentiality is a professional obligation under the Migration Agents Code of Conduct, and it applies from the first conversation, whether or not you engage us afterwards.',
      },
      {
        question: 'Can we meet online?',
        answer:
          'Yes — consultations are available by video as well as in person at our Perth CBD office, so your location is never a barrier.',
      },
    ],
    cta: {
      heading: CTA_HEADING,
      body: "**[Book a consultation]** and let's talk through your options.",
    },
    related: [
      'ART Review Applications',
      'Subclass 189 Skilled Independent Visa',
      'Partner Visa (Onshore) 820/801',
    ],
    disclaimer:
      'Immigration assistance is provided by Sunil Uprety, Registered Migration Agent (MARN: 2318234). Information on this page is general in nature and current at the time of publishing. Requirements, processing times and government policy can change — contact us to confirm the requirements currently in force and any current pricing before you act. This information does not constitute immigration assistance or legal advice. Last reviewed: July 2026.',
  },
];

async function upsert(payload: Payload, p: PageSeed) {
  const canonical = p.section === 'root' ? `/${p.slug}` : `/${p.section}/${p.slug}`;
  // `content` is the one boundary where the markdown->Lexical output (a structurally
  // valid but loosely typed AST) meets the strict generated richText shape; assert it
  // here rather than hand-typing the whole tree.
  const data = {
    title: p.title,
    section: p.section,
    status: 'published' as const,
    content: mdToLexical(p.body) as ServicePage['content'],
    faq: p.faq,
    cta: {
      heading: p.cta.heading,
      body: p.cta.body,
      ...(p.cta.buttonHref ? { buttonHref: p.cta.buttonHref } : {}),
    },
    relatedLinks: p.related.map((label) => ({ label })),
    disclaimer: p.disclaimer,
    seo: { metaTitle: p.metaTitle, metaDescription: p.metaDescription, canonicalUrl: canonical },
  };

  const found = await payload.find({
    collection: 'service-pages',
    where: { slug: { equals: p.slug } },
    limit: 1,
  });
  const existing = found.docs[0];
  if (existing) {
    return payload.update({
      collection: 'service-pages',
      id: existing.id,
      data,
      overrideAccess: true,
    });
  }
  return payload.create({
    collection: 'service-pages',
    data: { ...data, slug: p.slug },
    overrideAccess: true,
  });
}

export async function seedServicePages() {
  const payload = await getPayload({ config });
  for (const p of PAGES) {
    await upsert(payload, p);
  }
  console.log(`Seeded ${PAGES.length} service pages (verbatim from source document).`);
}

seedServicePages()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
