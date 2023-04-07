import { Comment, PrismaClient, User } from "@prisma/client";
import faker from "faker";

import { createValidationMiddleware } from "../../src";
import client from "./client";

describe("smoke", () => {
  let testClient: PrismaClient;

  beforeAll(() => {
    testClient = new PrismaClient();
    testClient.$use(
      createValidationMiddleware({
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
      })
    );
  });
  afterAll(async () => {
    await client.user.deleteMany({});
    await client.comment.deleteMany({});

    // disconnect test client
    await testClient.$disconnect();
  });

  it("throws an error with the operation's stacktrace", async () => {
    expect.assertions(1);

    try {
      await testClient.user.create({
        data: {
          email: "test",
          name: "test",
        },
      });
    } catch (e) {
      const error = e as Error;
      const operationStackLine = error.stack?.split("\n")[1];
      // eslint-disable-next-line
      expect(operationStackLine!.includes("smoke.test.ts")).toBeTruthy();
    }
  });

  it("allows valid data to be created and updated", async () => {
    const user = await client.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.name.findName(),
      },
    });

    const updatedUser = await testClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: "test2@test.com",
      },
    });

    expect(updatedUser.email).toBe("test2@test.com");
  });

  it("prevents creates with invalid data", async () => {
    await expect(
      testClient.user.create({
        data: {
          email: "test",
          name: "test",
        },
      })
    ).rejects.toThrowError(
      `User.create: email must include @`
    );

    expect(
      await client.user.findFirst({ where: { email: "test" } })
    ).toBeNull();
  });

  it("prevents updates with invalid data", async () => {
    const user = await client.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.name.findName(),
      },
    });

    await expect(
      testClient.user.update({
        where: {
          id: user.id,
        },
        data: {
          email: "test",
        },
      })
    ).rejects.toThrowError(
      `User.update: email must include @`
    );

    expect(
      await client.user.findFirst({ where: { email: "test" } })
    ).toBeNull();
  });
});
