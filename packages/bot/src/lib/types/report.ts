// Copyright (c) 2021 Siberian, Inc. All rights reserved.

export interface IReport {
  readonly id: number
  readonly user_id: string
  readonly message_id: string
  readonly thread_id: string
  readonly count: number
  readonly created_at: Date
  readonly updated_at: Date
}
