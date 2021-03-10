export interface IReaction {
  readonly name: string
  readonly roleId: string
  readonly emojiId: string
  readonly rawEmojiId: string
  readonly autoRemove: boolean
}

export interface IRoleMessage {
  name: string
  description: string
  reactions: Array<IReaction>
}
