import type {
  AppointmentInput,
  DateRange,
  ProviderRef,
  SchedulingProvider,
  Slot,
} from '../types.ts';

/**
 * V1 default. The practice is appointment-only; the manual adapter records intent
 * and returns a synthetic reference. No external calendar is contacted, so a
 * consultation is NEVER lost to a provider outage. Sunil confirms out of band and
 * the record's status moves requested -> confirmed in the CMS.
 */
export class ManualSchedulingProvider implements SchedulingProvider {
  readonly id = 'manual' as const;

  async getAvailability(_range: DateRange): Promise<Slot[]> {
    // Manual provider advertises no fixed slots; the intake captures a preference.
    return [];
  }

  async createAppointment(input: AppointmentInput): Promise<ProviderRef> {
    // Idempotent by bookingKey: re-submitting the same request yields the same ref.
    return `manual:${input.bookingKey}`;
  }

  async reschedule(ref: ProviderRef): Promise<ProviderRef> {
    return ref;
  }

  async cancel(_ref: ProviderRef): Promise<void> {
    /* no-op: cancellation is reflected on our record */
  }
}
