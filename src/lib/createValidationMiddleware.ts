import { Prisma } from "@prisma/client";
import { createNestedMiddleware } from "prisma-nested-middleware";
import { Options, Validators } from "./types";

const defaultCustomizeError: Options["customizeError"] = (error, params) => {
  error.name = "ValidationError";
  error.message = `${params.model}.${params.action}: ${error.message}`;
  return error;
};

export const createValidationMiddleware = (
  validators: Validators,
  options: Partial<Options> = {}
): Prisma.Middleware => {
  const { customizeError = defaultCustomizeError } = options;

  return createNestedMiddleware((params, next) => {
    if (!params.model) return next(params);

    const validator = validators[params.model];
    if (!validator) return next(params);

    try {
      switch (params.action) {
        case "upsert": {
          validator(params.args.create);
          validator(params.args.update);
          break;
        }

        case "create": {
          if (params.scope) {
            validator(params.args);
            break;
          }

          validator(params.args.data);
          break;
        }

        case "update": {
          if (params.scope && !params.scope.relations.to.isList) {
            validator(params.args);
            break;
          }

          validator(params.args.data);
          break;
        }

        case "updateMany": {
          validator(params.args.data);
          break;
        }

        case "createMany": {
          params.args.data.forEach((data: any) => {
            validator(data);
          });
          break;
        }

        case "connectOrCreate": {
          validator(params.args.create);
          break;
        }

        default:
          break;
      }
    } catch (e) {
      throw customizeError(e as Error, params);
    }

    return next(params);
  });
};
