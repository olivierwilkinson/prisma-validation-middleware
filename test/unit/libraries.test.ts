import { assert, mask, size, string, object, Struct } from "superstruct";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import { createValidationMiddleware } from "../../src";
import { createParams } from "./utils/createParams";

const next = () => Promise.resolve({});

describe("libraries", () => {
  it("can validate fields using superstruct", async () => {
    function validate<T extends Struct<any, any>>(struct: T) {
      return (data: any) => assert<T, any>(mask(data, struct), struct);
    }

    const middleware = createValidationMiddleware({
      User: validate(
        object({
          email: size(string(), 10, 128),
        })
      ),
    });

    await expect(
      middleware(
        createParams("User", "update", {
          where: { id: 1 },
          data: { email: "test@test.com" },
        }),
        next
      )
    ).resolves.toEqual({});

    await expect(
      middleware(
        createParams("User", "update", {
          where: { id: 1 },
          data: { email: "test" },
        }),
        next
      )
    ).rejects.toThrowError(
      "User.update: At path: email -- Expected a string with a length between `10` and `128` but received one with a length of `4`"
    );
  });

  it("can validate fields using zod", async () => {
    const validate = (schema: z.ZodType<any>) => (data: any) => {
      try {
        schema.parse(data);
      } catch (err) {
        throw fromZodError(err as z.ZodError, {
          prefix: "",
          prefixSeparator: "",
        });
      }
    };

    const middleware = createValidationMiddleware({
      User: validate(
        z.object({
          email: z.string().min(10).max(128),
        })
      ),
    });

    await expect(
      middleware(
        createParams("User", "update", {
          where: { id: 1 },
          data: { email: "test@test.com" },
        }),
        next
      )
    ).resolves.toEqual({});

    await expect(
      middleware(
        createParams("User", "update", {
          where: { id: 1 },
          data: { email: "test" },
        }),
        next
      )
    ).rejects.toThrowError(
      'User.update: String must contain at least 10 character(s) at "email"'
    );
  });
});
