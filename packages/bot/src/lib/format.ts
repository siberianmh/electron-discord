// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

export function formatTimestamp(date: Date | null): string {
  if (!date) {
    return '?'
  }

  return `<t:${Math.floor(date.getTime() / 1000)}:R>`
}
