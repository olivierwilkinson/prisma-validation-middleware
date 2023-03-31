import { User } from "@prisma/client";
import { createValidationMiddleware } from "../../src";
import { createParams } from "./utils/createParams";

const next = () => Promise.resolve({});

describe("update", () => {
  it("validates when using root upsert", async () => {
    const middleware = createValidationMiddleware({
      User: (data: Partial<User>) => {
        if (data.email && !data.email.includes("@")) {
          throw new Error("email must include @");
        }
      },
    });

    await expect(
      middleware(
        createParams("User", "upsert", {
          where: { id: 1 },
          update: { email: "test@test.com" },
          create: {
            email: "test@test.com",
            name: "test",
          },
        }),
        next
      )
    ).resolves.toEqual({});

    // validates update
    await expect(
      middleware(
        createParams("User", "upsert", {
          where: { id: 1 },
          update: { email: "test" },
          create: {
            email: "test@test.com",
            name: "test",
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.upsert: email must include @`
    );

    // validates create
    await expect(
      middleware(
        createParams("User", "upsert", {
          where: { id: 1 },
          update: { email: "test@test.com" },
          create: {
            email: "test",
            name: "test",
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.upsert: email must include @`
    );
  });

  it("validates when using nested upsert", async () => {
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
              upsert: {
                where: { id: 2 },
                update: { email: "test@test.com" },
                create: {
                  email: "test@test.com",
                  name: "test",
                },
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
              upsert: {
                where: { id: 2 },
                update: { email: "test" },
                create: {
                  email: "test@test.com",
                  name: "test",
                },
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.upsert: email must include @`
    );

    await expect(
      middleware(
        createParams("Profile", "update", {
          where: { id: 1 },
          data: {
            users: {
              upsert: {
                where: { id: 2 },
                update: { email: "test@test.com" },
                create: {
                  email: "test",
                  name: "test",
                },
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.upsert: email must include @`
    );
  });

  it("validates nested toOne upsert", async () => {
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
              upsert: {
                update: { email: "test@test.com" },
                create: {
                  email: "test@test.com",
                  name: "test",
                },
              },
            },
          },
        }),
        next
      )
    ).resolves.toEqual({});

    // validates update
    await expect(
      middleware(
        createParams("Comment", "update", {
          where: { id: 1 },
          data: {
            author: {
              upsert: {
                update: { email: "test" },
                create: {
                  email: "test@test.com",
                  name: "test",
                },
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.upsert: email must include @`
    );

    // validates create
    await expect(
      middleware(
        createParams("Comment", "update", {
          where: { id: 1 },
          data: {
            author: {
              upsert: {
                update: { email: "test@test.com" },
                create: {
                  email: "test",
                  name: "test",
                },
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.upsert: email must include @`
    );
  });
});
