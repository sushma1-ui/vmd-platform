# @vmd/forms
Validation (from `@vmd/schema`) + a provider-agnostic submit pipeline: validate →
spam (Turnstile + honeypot) → rate limit → persist → notify → track. Inline,
on-blur validation rules per Blueprint §9.4 live here.
