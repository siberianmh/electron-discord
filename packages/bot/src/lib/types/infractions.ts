// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

export enum InfractionType {
  Kick = 0,
  Ban,
  Warn,
  Mute,
}

export const infractionType = {
  [InfractionType.Kick]: InfractionType[InfractionType.Kick].toLowerCase(),
  [InfractionType.Ban]: InfractionType[InfractionType.Ban].toLowerCase(),
  [InfractionType.Warn]: InfractionType[InfractionType.Warn].toLowerCase(),
  [InfractionType.Mute]: InfractionType[InfractionType.Mute].toLowerCase(),
}
