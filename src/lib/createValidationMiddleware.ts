import { Prisma } from "@prisma/client";
import { createNestedMiddleware } from "prisma-nested-middleware";
import { Config } from "./types";

export const createValidationMiddleware = (
  config: Config
): Prisma.Middleware => {
  return createNestedMiddleware((params, next) => {
    if (!params.model) return next(params);

    const validator = config[params.model];
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
      const error = e as Error;
      error.message = `Validation error at ${params.model}.${params.action}: ${error.message}`;
      throw error;
    }

    return next(params);
  });
};
