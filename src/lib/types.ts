import { Prisma } from "@prisma/client";

export type Config = Partial<
  Record<Prisma.ModelName, (data: any) => void>
>;
