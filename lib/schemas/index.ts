import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().min(2, "Nome obrigatório"),
  birthDate: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
  marketingConsent: z.boolean().optional(),
  marketingConsentDate: z.string().optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;

export const procedureSchema = z.object({
  procedureTypeId: z.string().optional(),
  customName: z.string().optional(),
  amountCents: z.number().int().positive("Valor obrigatório"),
  currency: z.literal("EUR"),
  date: z.string().min(1, "Data obrigatória"),
  notes: z.string().optional(),
});

export type ProcedureInput = z.infer<typeof procedureSchema>;

export const appointmentSchema = z.object({
  patientId: z.string().optional(),
  nameSnapshot: z.string().min(1, "Nome obrigatório"),
  procedureTypeId: z.string().optional(),
  procedureText: z.string().optional(),
  date: z.string().min(1, "Data obrigatória"),
  time: z.string().min(1, "Horário obrigatório"),
  locationId: z.string().optional(),
  locationText: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["AGENDADO", "CONFIRMADO", "REALIZADO", "CANCELADO"]),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
