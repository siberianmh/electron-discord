// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { ColorResolvable } from 'discord.js'

export interface IStyle {
  readonly colors: Record<string, ColorResolvable>
  readonly emojis: Record<string, string>
  readonly icons: Record<string, string>
}
