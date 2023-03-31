import { User, Comment } from "@prisma/client";
import { createValidationMiddleware } from "../../src";
import { createParams } from "./utils/createParams";

const next = () => Promise.resolve({});

describe("validation", () => {
  it("can validate a single field", async () => {
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
          data: {
            name: "test",
            email: "test@test.com",
          },
        }),
        next
      )
    ).resolves.toEqual({});

    await expect(
      middleware(
        createParams("User", "create", {
          data: {
            name: "test",
            email: "test",
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.create: email must include @`
    );
  });

  it("can validate multiple fields", async () => {
    const middleware = createValidationMiddleware({
      User: (data: Partial<User>) => {
        if (data.email && !data.email.includes("@")) {
          throw new Error("email must include @");
        }
        if (data.name && !data.name.includes("test")) {
          throw new Error("name must include test");
        }
      },
    });

    await expect(
      middleware(
        createParams("User", "create", {
          data: {
            name: "test",
            email: "test@test.com",
          },
        }),
        next
      )
    ).resolves.toEqual({});

    // validates incorrect email on one operation
    await expect(
      middleware(
        createParams("User", "create", {
          data: {
            name: "test",
            email: "test",
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.create: email must include @`
    );

    // validates incorrect name on another operation
    await expect(
      middleware(
        createParams("User", "create", {
          data: {
            name: "bob",
            email: "test@test.com",
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.create: name must include test`
    );

    // validates both when they are incorrect
    await expect(
      middleware(
        createParams("User", "create", {
          data: {
            name: "bob",
            email: "test",
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at User.create: email must include @`
    );
  });

  it("can validate multiple models", async () => {
    const middleware = createValidationMiddleware({
      User: (data: Partial<User>) => {
        if (data.email && !data.email.includes("@")) {
          throw new Error("email must include @");
        }
      },
      Comment: (data: Partial<Comment>) => {
        if (data.content && !data.content.includes("test")) {
          throw new Error("content must include test");
        }
      },
    });

    await expect(
      middleware(
        createParams("User", "create", {
          data: {
            name: "test",
            email: "test@test.com",
            comments: {
              create: {
                content: "test",
              },
            },
          },
        }),
        next
      )
    ).resolves.toEqual({});

    // validates incorrect content on one operation
    await expect(
      middleware(
        createParams("User", "create", {
          data: {
            name: "test",
            email: "test@test.com",
            comments: {
              create: {
                content: "bob's your uncle",
              },
            },
          },
        }),
        next
      )
    ).rejects.toThrowError(
      `Validation error at Comment.create: content must include test`
    );

    // validates incorrect content on another operation
    await expect(
      middleware(
        createParams("User", "create", {
          data: {
            name: "test",
            email: "test",
            comments: {
              create: {
                content: "test",
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
