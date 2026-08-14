import React from 'react';

/**
 * Friendly dashboard panel shown above the default Payload dashboard
 * (admin.components.beforeDashboard). Gives a non-technical editor a clear
 * starting point: a short welcome and one-click actions for the most common
 * tasks, so they never have to hunt through the sidebar to get going.
 *
 * Server component (no client interactivity) — just links to admin routes.
 */
const actions: { label: string; hint: string; href: string }[] = [
  {
    label: 'Edit the Home page',
    hint: 'Hero, sections and calls to action',
    href: '/admin/globals/homepage',
  },
  {
    label: 'Edit the About page',
    hint: 'Our story, values and team intro',
    href: '/admin/globals/about-page',
  },
  {
    label: 'Edit the Contact page',
    hint: 'Contact details and intro copy',
    href: '/admin/globals/contact-page',
  },
  {
    label: 'Write a blog post',
    hint: 'Add a new article to the blog',
    href: '/admin/collections/articles/create',
  },
  {
    label: 'Upload an image',
    hint: 'Add a photo to the media library',
    href: '/admin/collections/media/create',
  },
  {
    label: 'View website enquiries',
    hint: 'Messages from the website forms',
    href: '/admin/collections/leads',
  },
];

export const Welcome: React.FC = () => {
  return (
    <section
      style={{
        marginBlockEnd: '2rem',
        padding: '1.5rem',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '8px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem' }}>Welcome to your content manager</h2>
      <p style={{ margin: '0 0 1.25rem', color: 'var(--theme-elevation-600)', maxWidth: '60ch' }}>
        Pick a page to edit or a quick action below. After you publish, your changes appear on the
        live website within a couple of minutes.
      </p>
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
        }}
      >
        {actions.map((a) => (
          <a
            key={a.href}
            href={a.href}
            style={{
              display: 'block',
              padding: '0.85rem 1rem',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '6px',
              background: 'var(--theme-elevation-0)',
              textDecoration: 'none',
              color: 'var(--theme-text)',
            }}
          >
            <span style={{ display: 'block', fontWeight: 600 }}>{a.label} →</span>
            <span
              style={{ display: 'block', fontSize: '0.8rem', color: 'var(--theme-elevation-600)' }}
            >
              {a.hint}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Welcome;
