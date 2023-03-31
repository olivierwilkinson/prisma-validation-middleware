import { User } from "@prisma/client";
import { createValidationMiddleware } from "../../src";
import { createParams } from "./utils/createParams";

const next = () => Promise.resolve({});

describe("createMany", () => {
  it("validates when using root createMany", async () => {
    const middleware = createValidationMiddleware({
      User: (data: Partial<User>) => {
        if (data.email && !data.email.includes("@")) {
          throw new Error("email must include @");
        }
      },
    });

    await expect(
      middleware(
        createParams("User", "createMany", {
          data: [{ name: "test", email: "test@test.com" }],
        }),
        next
      )
    ).resolves.toEqual({});

    await expect(
      middleware(
        createParams("User", "createMany", {
          data: [{ name: "test", email: "test" }],
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.createMany: email must include @`
    );
  });

  it("validates when using nested createMany", async () => {
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
              createMany: {
                data: [
                  {
                    name: "test",
                    email: "test@test.com",
                  },
                  {                  
                    name: "test two",
                    email: "test2@test.com",
                  },
                ],
              },
            },
          },
        }),
        next
      )
    ).resolves.toEqual({});

    // validates first item
    await expect(
      middleware(
        createParams("Profile", "update", {
          where: { id: 1 },
          data: {
            users: {
              createMany: {
                data: [
                  {
                    name: "test",
                    email: "test",
                  },
                ],
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.createMany: email must include @`
    );

    // validates second item
    await expect(
      middleware(
        createParams("Profile", "update", {
          where: { id: 1 },
          data: {
            users: {
              createMany: {
                data: [
                  {                  
                    name: "test",
                    email: "test@test.com",
                  },
                  {                  
                    name: "test two",
                    email: "test2",
                  },
                ],
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.createMany: email must include @`
    );
  });
});
