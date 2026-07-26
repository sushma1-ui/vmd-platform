import type { Metadata } from 'next';
import config from '@payload-config';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import { importMap } from '../importMap.js';

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string>>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

// Explicit return type (references the imported RootPage, a nameable path) so the
// build's type-check never has to infer a non-portable `@types/react` path under
// pnpm's isolated node_modules on Vercel (TS2742). Keeps type-checking fully on.
export default function Page({ params, searchParams }: Args): ReturnType<typeof RootPage> {
  return RootPage({ config, params, searchParams, importMap });
}
