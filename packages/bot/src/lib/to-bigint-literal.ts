// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import type { Snowflake } from 'discord.js'

export const toBigIntLiteral = (
  value: string | number | bigint | boolean,
): Snowflake /** `${bigint}` */ => {
  return `${BigInt(value)}`
}
