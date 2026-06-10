/**
 * Central branding configuration.
 *
 * The product is multi-tenant by design: it will be sold as a subscription
 * to facial-aesthetics practitioners in Portugal. Everything tenant-facing
 * (clinic name, initials, tagline) reads from here — never hardcode a
 * clinic name in a component. When tenant accounts land, this object moves
 * to a `Clinic` table and is resolved per-session; the component contract
 * stays the same.
 */

/** The product itself — shown on the login screen and marketing surfaces. */
export const PRODUCT = {
  name: "Continuum",
  tagline: "CRM de Estética Facial",
  description:
    "Gestão de pacientes, agenda e faturação para profissionais de estética facial.",
} as const;

/** The current tenant (default install: Dra. Cláudia Pacheco). */
export const TENANT = {
  name: "Dra. Cláudia Pacheco",
  shortName: "Cláudia Pacheco",
  initials: "CP",
  subtitle: "Clínica · Estética Facial",
} as const;
