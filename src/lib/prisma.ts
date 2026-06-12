// src/lib/prisma.ts
// Erklärt: Wir erstellen eine einzige Datenbankverbindung,
// die wir überall in der App wiederverwenden.

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
export const prisma = new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma