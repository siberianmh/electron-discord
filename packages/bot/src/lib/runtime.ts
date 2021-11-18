// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

const __dev__ = process.env.NODE_ENV === 'development'

export const enableThreadHelp =
  __dev__ || process.env.ENABLE_THREAD_CHANNELS === 'true'

export const enableRolesModule =
  !__dev__ || process.env.ENALBE_ROLES_MODULE === 'true'

/**
 * Does this should use Electron values. Use if some value in process of
 * migration is different from ours.
 */
export const IS_ELECTRON_BUILD = process.env.IS_ELECTRON_BUILD === 'true'
