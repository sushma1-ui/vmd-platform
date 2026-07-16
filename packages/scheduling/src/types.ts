/** The scheduling port (ADR-0001). Extension points documented in docs/ADR/0001. */
export interface DateRange {
  fromUtc: string;
  toUtc: string;
}
export interface Slot {
  startUtc: string;
  endUtc: string;
  /** Opaque provider hint (e.g. calendar id, event-type id). Never rendered. */
  providerHint?: string;
}
export interface AvailabilityOptions {
  durationMinutes: number;
  timezone: string;
}
export interface AppointmentInput {
  /** Our consultation record id — the idempotency key across retries. */
  bookingKey: string;
  slot: Slot;
  attendee: { firstName: string; email: string; mobile?: string };
  timezone: string;
  notes?: string;
}
/** Opaque reference the provider returns; stored on the consultation record. */
export type ProviderRef = string;

export interface SchedulingProvider {
  readonly id: 'manual' | 'calcom' | 'calendly' | 'google' | 'outlook';
  getAvailability(range: DateRange, opts: AvailabilityOptions): Promise<Slot[]>;
  createAppointment(input: AppointmentInput): Promise<ProviderRef>;
  reschedule(ref: ProviderRef, slot: Slot): Promise<ProviderRef>;
  cancel(ref: ProviderRef): Promise<void>;
}
