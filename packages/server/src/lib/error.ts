// Copyright (c) 2021 Siberian, Inc. All rights reserved.

export class ExpressError {
  public status: number
  public message: string

  public constructor({ message, status }: { status: number; message: string }) {
    this.status = status
    this.message = message
  }
}
