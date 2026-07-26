/* Payload admin root layout — canonical Payload 3 shape (Next 15, App Router).
   Config is imported via the @payload-config alias (wired by withPayload in
   next.config.mjs and by tsconfig paths), never a fragile relative path. */
import type { ServerFunctionClient } from 'payload';
import type { ReactNode, ReactElement } from 'react';
import config from '@payload-config';
import '@payloadcms/next/css';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import { importMap } from './admin/importMap.js';

export const metadata = { title: 'VMD Admin' };

/* Required by Payload 3.x: server actions the admin UI calls back into. */
const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({ ...args, config, importMap });
};

export default function Layout({ children }: { children: ReactNode }): ReactElement {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
