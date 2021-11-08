// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

export class ExpressError {
  public status: number
  public message: string

  public constructor({ message, status }: { status: number; message: string }) {
    this.status = status
    this.message = message
  }
}
