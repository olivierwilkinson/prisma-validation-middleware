import { User } from "@prisma/client";
import { createValidationMiddleware } from "../../src";
import { createParams } from "./utils/createParams";

const next = () => Promise.resolve({});

describe("update", () => {
  it("validates when using root updateMany", async () => {
    const middleware = createValidationMiddleware({
      User: (data: Partial<User>) => {
        if (data.email && !data.email.includes("@")) {
          throw new Error("email must include @");
        }
      },
    });

    await expect(
      middleware(
        createParams("User", "updateMany", {
          where: { id: 1 },
          data: { email: "test@test.com" },
        }),
        next
      )
    ).resolves.toEqual({});

    await expect(
      middleware(
        createParams("User", "updateMany", {
          where: { id: 1 },
          data: { email: "test" },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.updateMany: email must include @`
    );
  });

  it("validates when using nested updateMany", async () => {
    const middleware = createValidationMiddleware({
      User: (data: Partial<User>) => {
        if (data.email && !data.email.includes("@")) {
          throw new Error("email must include @");
        }
      },
    });

    await expect(
      middleware(
        createParams("Profile", "update", {
          where: { id: 1 },
          data: {
            users: {
              updateMany: {
                where: { id: 2 },
                data: { email: "test@test.com" },
              },
            }
          },
        }),
        next
      )
    ).resolves.toEqual({});

    await expect(
      middleware(
        createParams("Profile", "update", {
          where: { id: 1 },
          data: {
            users: {
              updateMany: {
                where: { id: 2 },
                data: { email: "test" },
              },
            }
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.updateMany: email must include @`
    );
  });
});
