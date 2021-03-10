export const style = {
  colors: {
    softRed: 0xcd6d6d,
    softGreen: 0x68c290,
    red: '#FF0000',
    yellow: '#FFB94E',
    greenBright: '#32CD32',
    electronBlue: '#358397',
  },

  emojis: {
    deleteBucket: '🗑',
    statusOffline: '<:status_offline:801990698357489694>',
    statusOnline: '<:status_online:801988207100559360>',

    // pronoun
    zezir: '<:ze:805243043527131196>',
    xexen: '<:xe:805243043132604457>',
    thenthey: '<:they:805243043582181376>',
    sheher: '<:she:805243043531587585>',
    nopronouns: '<:nopronouns:805243043653222450>',
    itits: '<:it:805243043472867358>',
    hehim: '<:he:805243043425943553>',
    faefaer: '<:fae:805243043653484574>',
    anypronouns: '<:anypronouns:805243043183067147>',
  },

  icons: {
    crownGreen: 'https://cdn.discordapp.com/emojis/469964154719961088.png',
    crownRed: 'https://cdn.discordapp.com/emojis/469964154879344640.png',

    hashGreen: 'https://cdn.discordapp.com/emojis/469950144918585344.png',
    hashRed: 'https://cdn.discordapp.com/emojis/469950145413251072.png',

    messageDelete: 'https://cdn.discordapp.com/emojis/472472641320648704.png',

    userBan: 'https://cdn.discordapp.com/emojis/469952898026045441.png',
  },
}

export const guild = {
  id: '745037351163527189',
  invite: 'https://discord.gg/electron',

  categories: {
    helpAvailable: '745038318479081483',
    helpOngoing: '763429207791239168',
    helpDormant: '763429965726351392',
  },

  channels: {
    roles: '760189688492720139',
    rules: '745041677185450005',
    voiceRules: '776136611510747186',
    adminBotInteractions: '771069886696914994',
    askHelpChannel: '748284419525312553',
    modLog: '764542608256270406',
  },

  roles: {
    everyone: '745037351163527189',
    maintainer: '745039155498582067',
    helpCooldown: '772835574197256199',

    //#region etc

    // pronouns
    anyPronouns: '760191162291191820',
    faeFaer: '760191164770287636',
    heHim: '760191175293796353',
    itIts: '760191175336132608',
    noPronouns: '760191176955002922',
    sheHer: '760191692510068806',
    theyThem: '760191695953723392',
    xeXim: '760191852892258305',
    zeZir: '760191899997962260',

    // os
    windows: '778343819590107218',
    macOS: '778343887382773801',
    linux: '778343916108906507',

    //#endregion
  },
}

export const urls = {
  githubBotURL: 'https://github.com/siberianmh/electron-discord',
}

export const helpChannels = {
  /**
   * The number of maximum help channels which can be taken.
   */
  maxAvailableHelpChannels: 1,

  /**
   * Allowed duration of inactivity before marking a channel dormant.
   */
  dormantChannelTimeout: 12, // hours

  dormantChannelLoop: 10000, // ms

  /**
   * Maximum number of channels across all 3 categories
   * **N.B.** Discord has a hard limit of 50 channels per category, so this shouldn't be > 50
   */
  maxTotalChannels: 32,

  /**
   * Prefix for help channel names
   */
  namePrefix: 'help-',
}
