/**
 * @vmd/scheduling — public API (ADR-0001).
 *
 * Consumers import { getSchedulingProvider } and the port types. They must not
 * import a concrete adapter directly — that is what keeps providers swappable.
 */
export type {
  SchedulingProvider,
  Slot,
  DateRange,
  AvailabilityOptions,
  AppointmentInput,
  ProviderRef,
} from './types.ts';
import type { SchedulingProvider } from './types.ts';
import { ManualSchedulingProvider } from './adapters/manual.ts';

export type SchedulingProviderId = SchedulingProvider['id'];

/**
 * Factory. Selects the adapter from SCHEDULING_PROVIDER. Future adapters register
 * here; nothing else in the app changes. V1 supports 'manual'; the others throw a
 * clear "not yet wired" error until their module lands.
 */
export function getSchedulingProvider(id: SchedulingProviderId = 'manual'): SchedulingProvider {
  switch (id) {
    case 'manual':
      return new ManualSchedulingProvider();
    case 'calcom':
    case 'calendly':
    case 'google':
    case 'outlook':
      throw new Error(
        `Scheduling provider "${id}" is not wired yet. Add an adapter in src/adapters and register it here (ADR-0001). No caller changes required.`,
      );
    default: {
      const _exhaustive: never = id;
      throw new Error(`Unknown scheduling provider: ${String(_exhaustive)}`);
    }
  }
}
