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
