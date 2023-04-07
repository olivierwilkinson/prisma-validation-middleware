import { Prisma } from "@prisma/client";
import { NestedParams } from "prisma-nested-middleware";

export type Validator = (data: any) => void;

export type Validators = Partial<
  Record<Prisma.ModelName, Validator>
>;

export type Options = {
  customizeError?: (error: Error, params: NestedParams) => Error;
}
