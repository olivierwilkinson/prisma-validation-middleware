import { User } from "@prisma/client";
import { createValidationMiddleware } from "../../src";
import { createParams } from "./utils/createParams";

const next = () => Promise.resolve({});

describe("create", () => {
  it("validates when using root create", async () => {
    const middleware = createValidationMiddleware({
      User: (data: Partial<User>) => {
        if (data.email && !data.email.includes("@")) {
          throw new Error("email must include @");
        }
      },
    });

    await expect(
      middleware(
        createParams("User", "create", {
          data: { name: "test", email: "test@test.com" },
        }),
        next
      )
    ).resolves.toEqual({});

    await expect(
      middleware(
        createParams("User", "create", {
          data: { name: "test", email: "test" },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.create: email must include @`
    );
  });

  it("validates when using nested create", async () => {
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
              create: {
                name: "test", email: "test@test.com"
              },
            },
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
              create: {
                name: "test", email: "test"
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.create: email must include @`
    );
  });

  it("validates when using nested toOne create", async () => {
    const middleware = createValidationMiddleware({
      User: (data: Partial<User>) => {
        if (data.email && !data.email.includes("@")) {
          throw new Error("email must include @");
        }
      },
    });

    await expect(
      middleware(
        createParams("Comment", "update", {
          where: { id: 1 },
          data: {
            author: {
              create: {
                name: "test",
                email: "test@test.com",
              },
            },
          },
        }),
        next
      )
    ).resolves.toEqual({});

    await expect(
      middleware(
        createParams("Comment", "update", {
          where: { id: 1 },
          data: {
            author: {
              create: {
                name: "test",
                email: "test",
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.create: email must include @`
    );
  });
});
