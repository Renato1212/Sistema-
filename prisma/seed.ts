import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subMonths } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@clinicacp.com" },
    update: {},
    create: {
      name: "Dra. Cláudia Pacheco",
      email: "admin@clinicacp.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Locations
  const locBR = await prisma.location.upsert({
    where: { id: "loc-br" },
    update: {},
    create: { id: "loc-br", name: "Clínica CP — São Paulo, BR", active: true },
  });
  const locPT = await prisma.location.upsert({
    where: { id: "loc-pt" },
    update: {},
    create: { id: "loc-pt", name: "Clínica CP — Lisboa, PT", active: true },
  });

  // Procedure types
  const procedureTypes = [
    { id: "pt-botox", name: "Botox", defaultPriceCents: 120000, defaultCurrency: "BRL" },
    { id: "pt-sculptra", name: "Sculptra", defaultPriceCents: 250000, defaultCurrency: "BRL" },
    { id: "pt-exossomos", name: "Exossomos", defaultPriceCents: 180000, defaultCurrency: "BRL" },
    { id: "pt-preenchimento", name: "Preenchimento", defaultPriceCents: 150000, defaultCurrency: "BRL" },
    { id: "pt-bioestimulador", name: "Bioestimulador", defaultPriceCents: 200000, defaultCurrency: "BRL" },
    { id: "pt-harmonizacao", name: "Harmonização Facial", defaultPriceCents: 300000, defaultCurrency: "BRL" },
    { id: "pt-estetica-dental", name: "Estética Dental", defaultPriceCents: 80000, defaultCurrency: "BRL" },
  ];

  for (const pt of procedureTypes) {
    await prisma.procedureType.upsert({
      where: { id: pt.id },
      update: {},
      create: pt,
    });
  }

  // Patients
  const patientsData = [
    { fullName: "Ana Beatriz Oliveira", email: "ana@example.com", phone: "+55 11 99000-0001", birthDate: new Date("1985-03-15") },
    { fullName: "Carolina Mendes", email: "carol@example.com", phone: "+55 11 99000-0002", birthDate: new Date("1990-07-22") },
    { fullName: "Fernanda Lima", email: "fern@example.com", phone: "+55 21 99000-0003", birthDate: new Date("1978-11-08") },
    { fullName: "Juliana Costa", email: "juli@example.com", phone: "+55 11 99000-0004", birthDate: new Date("1995-01-30") },
    { fullName: "Mariana Souza", email: "mari@example.com", phone: "+351 91 000-0005", birthDate: new Date("1988-05-12") },
    { fullName: "Patrícia Alves", email: "pati@example.com", phone: "+351 91 000-0006", birthDate: new Date("1982-09-25") },
    { fullName: "Renata Ferreira", email: "rena@example.com", phone: "+55 11 99000-0007", birthDate: new Date("1993-04-18") },
    { fullName: "Sofia Rodrigues", email: "sofia@example.com", phone: "+351 91 000-0008", birthDate: new Date("1970-12-03") },
    { fullName: "Tatiana Gomes", email: "tati@example.com", phone: "+55 31 99000-0009", birthDate: new Date("1987-08-14") },
    { fullName: "Vanessa Carvalho", email: "vane@example.com", phone: "+55 11 99000-0010", birthDate: new Date("1992-02-28") },
  ];

  const createdPatients: { id: string }[] = [];
  for (const p of patientsData) {
    const patient = await prisma.patient.create({
      data: {
        ...p,
        marketingConsent: true,
        marketingConsentDate: subDays(new Date(), Math.floor(Math.random() * 180)),
        notes: "Paciente VIP — atendimento preferencial.",
      },
    });
    createdPatients.push(patient);
  }

  // Procedures (mixing BRL and EUR)
  const now = new Date();
  const procedureSeeds = [
    { pi: 0, typeId: "pt-botox", amount: 120000, currency: "BRL", daysAgo: 5 },
    { pi: 0, typeId: "pt-preenchimento", amount: 150000, currency: "BRL", daysAgo: 35 },
    { pi: 1, typeId: "pt-sculptra", amount: 250000, currency: "BRL", daysAgo: 10 },
    { pi: 1, typeId: "pt-harmonizacao", amount: 300000, currency: "BRL", daysAgo: 60 },
    { pi: 2, typeId: "pt-exossomos", amount: 95000, currency: "EUR", daysAgo: 3 },
    { pi: 2, typeId: "pt-bioestimulador", amount: 110000, currency: "EUR", daysAgo: 45 },
    { pi: 3, typeId: "pt-estetica-dental", amount: 80000, currency: "BRL", daysAgo: 15 },
    { pi: 3, typeId: "pt-botox", amount: 120000, currency: "BRL", daysAgo: 90 },
    { pi: 4, typeId: "pt-harmonizacao", amount: 180000, currency: "EUR", daysAgo: 7 },
    { pi: 4, typeId: "pt-sculptra", amount: 140000, currency: "EUR", daysAgo: 120 },
    { pi: 5, typeId: "pt-preenchimento", amount: 85000, currency: "EUR", daysAgo: 20 },
    { pi: 5, typeId: "pt-bioestimulador", amount: 110000, currency: "EUR", daysAgo: 180 },
    { pi: 6, typeId: "pt-botox", amount: 120000, currency: "BRL", daysAgo: 2 },
    { pi: 6, typeId: "pt-estetica-dental", amount: 80000, currency: "BRL", daysAgo: 25 },
    { pi: 7, typeId: "pt-exossomos", amount: 95000, currency: "EUR", daysAgo: 8 },
    { pi: 8, typeId: "pt-sculptra", amount: 250000, currency: "BRL", daysAgo: 12 },
    { pi: 8, typeId: "pt-preenchimento", amount: 150000, currency: "BRL", daysAgo: 50 },
    { pi: 9, typeId: "pt-harmonizacao", amount: 300000, currency: "BRL", daysAgo: 18 },
    { pi: 9, typeId: "pt-botox", amount: 120000, currency: "BRL", daysAgo: 75 },
    { pi: 9, typeId: null, customName: "Consulta de retorno", amount: 30000, currency: "BRL", daysAgo: 1 },
  ];

  for (const s of procedureSeeds) {
    await prisma.patientProcedure.create({
      data: {
        patientId: createdPatients[s.pi].id,
        procedureTypeId: s.typeId ?? undefined,
        customName: s.customName ?? null,
        amountCents: s.amount,
        currency: s.currency,
        date: subDays(now, s.daysAgo),
        notes: null,
      },
    });
  }

  // Appointments
  const appointmentSeeds = [
    { pi: 0, typeId: "pt-botox", daysOffset: 2, time: "10:00", locId: locBR.id, status: "CONFIRMADO" },
    { pi: 1, typeId: "pt-sculptra", daysOffset: 3, time: "14:30", locId: locBR.id, status: "AGENDADO" },
    { pi: 2, typeId: "pt-exossomos", daysOffset: -1, time: "09:00", locId: locPT.id, status: "REALIZADO" },
    { pi: 3, typeId: "pt-estetica-dental", daysOffset: 5, time: "11:00", locId: locBR.id, status: "AGENDADO" },
    { pi: 4, typeId: "pt-harmonizacao", daysOffset: 1, time: "15:00", locId: locPT.id, status: "CONFIRMADO" },
    { pi: 5, typeId: "pt-preenchimento", daysOffset: -3, time: "16:00", locId: locPT.id, status: "CANCELADO" },
    { pi: 6, typeId: "pt-botox", daysOffset: 7, time: "10:30", locId: locBR.id, status: "AGENDADO" },
    { pi: 7, typeId: "pt-bioestimulador", daysOffset: 0, time: "13:00", locId: locPT.id, status: "CONFIRMADO" },
  ];

  for (const a of appointmentSeeds) {
    const d = subDays(now, -a.daysOffset);
    await prisma.appointment.create({
      data: {
        patientId: createdPatients[a.pi].id,
        nameSnapshot: patientsData[a.pi].fullName,
        procedureTypeId: a.typeId,
        date: d,
        time: a.time,
        locationId: a.locId,
        status: a.status,
        notes: null,
      },
    });
  }

  // One appointment without a patient (name-only)
  await prisma.appointment.create({
    data: {
      patientId: null,
      nameSnapshot: "Novo Paciente (pré-cadastro)",
      procedureText: "Avaliação inicial",
      date: subDays(now, -4),
      time: "08:30",
      locationText: "A confirmar",
      status: "AGENDADO",
    },
  });

  console.log("✓ Seed concluído com sucesso!");
  console.log("  Login: admin@clinicacp.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
