<div align="center">
<h1>Prisma Validation Middleware</h1>

<p>Prisma middleware for validating data before creating or updating records.</p>

<p>
  Performing custom validation of data before creating or updating records using Prisma is generally left up to the
  application. This middleware provides a global way to validate data using a custom validation function and supports
  using third party validation libraries such as Zod or Superstruct.

  Data is validated before any create or update, including when using nested relations. It does this by using the
  <a href="https://github.com/olivierwilkinson/prisma-nested-middleware">prisma-nested-middleware</a> library to handle
  nested relations.
</p>

</div>

<hr />

[![Build Status][build-badge]][build]
[![version][version-badge]][package]
[![MIT License][license-badge]][license]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![PRs Welcome][prs-badge]][prs]

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [Usage with Zod](#usage-with-zod)
  - [Usage with Superstruct](#usage-with-superstruct)
- [Behavior](#behavior)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] and should be installed as one of your
project's dependencies:

```
npm install --save prisma-validation-middleware
```

`@prisma/client` is a peer dependency of this library, so you will need to
install it if you haven't already:

```
npm install --save @prisma/client
```

## Usage

To add validation to your Prisma client create the middleware using the `createValidationMiddleware` function and `$use`
it with your client.

The `createValidationMiddleware` function takes a config object where you can define the validation function you want to
use for your models. The validation function has the data being used to create or update the record as its only
argument. You can use this data to perform any validation you want and throw an error if the data is invalid.

```typescript
import { PrismaClient } from "@prisma/client";
import { createValidationMiddleware } from "prisma-validation-middleware";

const client = new PrismaClient();

client.$use(
  createValidationMiddleware({
    Comment: (data) => {
      if (data.content?.length > 1000) {
        throw new Error("content must be less than 1000 characters");
      }
    },
  })
);
```

You can pass a validation function for each model you want to validate. If you don't pass a validation function for a
model then no validation will be performed for it.

### Usage with Zod

To use this middleware with [Zod](https://github.com/colinhacks/zod) you can use a custom validation function that uses
Zod schemas to validate the data.

Below is an example function that takes a Zod Schema and returns a validation function, the `zod-validation-error`
library is used to convert the Zod error into more readable error:

```javascript
const { z } = require("zod");
const { fromZodError } = require("zod-validation-error");

function validate(schema) {
  return (data) => {
    try {
      schema.parse(data);
    } catch (err) {
      throw fromZodError(err, {
        prefix: "",
        prefixSeparator: "",
      });
    }
  };
}
```

If you are using Typescript the function would look like this:

```typescript
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

function validate(schema: z.ZodType<any>) {
  return (data: any) => {
    try {
      schema.parse(data);
    } catch (err) {
      throw fromZodError(err as z.ZodError, {
        prefix: "",
        prefixSeparator: "",
      });
    }
  };
}
```

You can then use the `validate` function to validate each model using Zod:

```typescript
import { z } from "zod";

client.$use(
  createValidationMiddleware({
    Comment: validate(
      z.object({
        // validate content is between 10 and 128 characters
        content: z.string().min(10).max(128),
      })
    ),
  })
);
```

### Usage with Superstruct

To use this middleware with [Superstruct](https://github.com/ianstormtaylor/superstruct) you can use a custom validation
function that uses Superstruct structs it to validate the data.

Below is an example function that takes a Superstruct `Struct` and returns a validation function that uses it to
validate the data:

```javascript
const { assert, mask } = require("superstruct");

function validate(struct) {
  return (data) => assert(mask(data, struct), struct);
}
```

If you are using Typescript the function would look like this:

```typescript
import { assert, mask, Struct } from "superstruct";

function validate<T extends Struct<any, any>>(struct: T) {
  return (data: any) => assert<T, any>(mask(data, struct), struct);
}
```

You can then use the `validate` function to validate each model using Superstruct:

```typescript
import { object, string, size } from "superstruct";

client.$use(
  createValidationMiddleware({
    Comment: validate(
      object({
        // validate content is between 10 and 128 characters
        content: size(string(), 10, 128),
      })
    ),
  })
);
```

## Behavior

### Validated Operations

Data is validated for `create`, `update`, `upsert`, `createMany`, `updateMany` and `connectOrCreate` operations. This
includes when models are created or updated through nested relations. For example all the Comment data below would be
validated:

```typescript
await client.post.update({
  where: { id: 1 },
  data: {
    comments: {
      update: {
        where: {
          id: 2,
        },
        data: {
          content: "My Comment Content",
        },
      },
    },
  },
});
```

### Error Messages

The error thrown by the middleware is the error thrown by the validation function prefixed with information about the
model and action that failed.

## LICENSE

Apache 2.0

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://github.com/olivierwilkinson/prisma-validation-middleware/workflows/prisma-validation-middleware/badge.svg
[build]: https://github.com/olivierwilkinson/prisma-validation-middleware/actions?query=branch%3Amaster+workflow%3Aprisma-validation-middleware
[version-badge]: https://img.shields.io/npm/v/prisma-validation-middleware.svg?style=flat-square
[package]: https://www.npmjs.com/package/prisma-validation-middleware
[downloads-badge]: https://img.shields.io/npm/dm/prisma-validation-middleware.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/prisma-validation-middleware
[license-badge]: https://img.shields.io/npm/l/prisma-validation-middleware.svg?style=flat-square
[license]: https://github.com/olivierwilkinson/prisma-validation-middleware/blob/main/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/olivierwilkinson/prisma-validation-middleware/blob/main/other/CODE_OF_CONDUCT.md
