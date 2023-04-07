import { User } from "@prisma/client";
import { createValidationMiddleware } from "../../src";
import { createParams } from "./utils/createParams";

const next = () => Promise.resolve({});

describe("connectOrCreate", () => {
  it("validates when connectOrCreate", async () => {
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
              connectOrCreate: {
                where: { id: 2 },
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
              connectOrCreate: {
                where: { id: 2 },
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
      `User.connectOrCreate: email must include @`
    );
  });

  it("validates toOne connectOrCreate", async () => {
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
              connectOrCreate: {
                where: { id: 2 },
                create: {
                  name: "test",
                  email: "test@test.com",
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
        createParams("Comment", "update", {
          where: { id: 1 },
          data: {
            author: {
              connectOrCreate: {
                where: { id: 2 },
                create: {
                  name: "test",
                  email: "test",
                },
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `User.connectOrCreate: email must include @`
    );
  });
});
