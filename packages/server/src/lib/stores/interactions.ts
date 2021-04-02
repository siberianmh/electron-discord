import * as express from 'express'
import { InteractionType, InteractionResponseType } from 'discord-interactions'

const quotes = {
  max_caulfield: [
    "That is a tasty plasma. Maybe I could sneak in and watch 'Final Fantasy: Spirits Within'. I don't care what anybody says, that's one of the best sci-fi films ever made.",
    'Max you are not crazy. You are not dreaming. It’s time to be an everyday hero.',
    'Broken? Oh man, are you cereal?',
    'When a door closes, a window opens... Or something like that.',
    'I wish I could stay in this moment forever. I guess I actually can now, but then it wouldn’t be a moment.',
    "Ahoy, Captain. At least I know you've got my back. When I swallowed your eye and my parents rushed me to the ER, I knew we were bonded forever...",
    'So cheesy, but, it makes me smile, thinking of the day Mom and I sewed that together.',
    'I love that Mom sent me a fat box of chocolate coconut bites for my birthday, and $200 gift certificate. She sure knows how to make a sad birthday happy.',
    'Samuel is such a weirdo. But I kinda like that about him.',
    'Joyce still works at Two Whales Diner. Best damn burgers in Arcadia!',
    "We made this grave for Chloe's kitty. Poor Bongo. He never saw that car coming.",
    'With great power comes great bullshit.',
    'The guy has his own style...',
    "I'm so glad you're my partner in crime.",
    'Insert groan here.',
    "Rachel in 'The Dark Room' over and over....",
    'Welcome to the real world...',
    'Empty. Good. Nobody can see my meltdown. Except for me.',
    'Chloe....Jefferson drugged and kidnapped me.',
    'Max, never Maxine.',
    'The last time I got the flu shot, I got the flu. Fuck you.',
    "I'm good to flow... thanks.",
    "Just relax. Stop torturing yourself. You have 'a gift'.",
    "Chloe, I am awesome! We're awesome!",
    'Fuck it.',
    "Okay girl, you don't get a photo op like this everyday...",
    'I think both of us could use a hug.',
    'Put some clothes on first, hillbilly.',
    'Ready for the mosh pit, shaka brah.',
    'Time for some Chloe cosplay.',
    'Release the kra-can!',
    'Eat shit and die.',
    'Blah, Blah, Blah.... God, I hate your voice now.',
    'Look at the trail of death you left behind!',
    'Time to change time.',
    "I couldn't let you die.",
    'This is my storm... I caused this... I caused all of this.',
    'I changed fate and destiny so much that... I actually did alter the course of everything. And all I really created was just death and destruction!',
    'I feel like I took this shot a thousand years ago.',
    'Fuck that! No way! You are my number one priority now. You are all that matters to me.',
    'Not anymore.',
    'Never.',
    'For luck.',
    'Wowser.',
    'I love you, Chloe.',
    'Who even cares? This class is hella bullshit!',
    "Go fuck your selfie, Victoria. I don't have time for this bullshit.",
    'Max the hacker strikes again!',
    "Don't mess with Max, bitches.",
    'Fresh meat.',
    'Join us, or diie!',
    'Welcome to my domain.',
  ],
  chloe_price: [
    "After 5 years you're still Max Caulfield.",
    'Nerd alert! My stepdad has a fully stocked garage. And he actually is a tiny tool.',
    'Welcome home, Max.',
    "This song fucking rules. Can't dance hippie? Come on! Rock out girl!",
    "Can't dance hippie? Come on! Shake that bony white ass!",
    'Shaka brah!',
    'Yo! Turn it off! Turn it off!',
    "This shit-pit has taken everyone I've ever loved... I'd like to drop a bomb on Arcadia Bay and turn it to fucking glass...",
    "Welcome to 'The Real Step-douches of Arcadia Bay'.",
    "Yes, it's been that kind of day.",
    'Rachel Amber. She was my Angel.',
    'Oh boo hoo, poor little rich kid.',
    'Get that gun away from me, psycho!',
    'Home-shit-home.',
    'That was her plan... our plan.',
    'Max, start from the beginning.',
    "I just don't think anybody is good enough for you... besides me.",
    "Yup, yup, I'm fucking insane in the brain!",
    'Everybody lies. No exceptions.',
    "As long as you're my partner in time.",
    "Beautiful, I don't give a shit. The world is ending, cool.",
    'Wrong. You got hella cash.',
    "That's right. Nathan Prescott is going down.",
    "I should've known. The Amazing SpiderMax.",
    "I hope you checked the perimeter, as my step-ass would say. Now, let's talk bidness.",
    "'Hella'? I hate that word, no offense.",
    "I'm sorry if that sounded too emo.",
    'NO EMOJI',
    "Wow, you're hardcore, Max! Now I can text Warren that he doesn't stand a chance! Unless he's into girl-on-girl action.",
    "I'm gonna medicate",
    "Boo yaa! Get it? Boo ya? Like I'm a scary punk ghost.",
    'The wi-fi out here sucks. Must take him days to download porn.',
    "I'm Price...Chloe Price..bang!",
    "Did you just say hella? I think I'm a good bad influence on you.",
    'Amazeballs! I literally got chills all over my neck.',
    'You better not rewind and take that kiss back.',
    "It's the company I keep...",
    'Crazy shit is the new normal for me.',
    'Max, this is the only way.',
    'Life is...so not fair.',
    'Max is a fucking child.',
    'Even my step... father deserves her alive.',
    "Who knows, maybe this could be Rachel's revenge. Our revenge.",
    "There's so many more people in Arcadia Bay who should live... way more than me...",
    "I know I've been selfish, but for once I think I should accept my fate... our fate...",
    'Max, you finally came back to me this week, and... you did nothing but show me your love and friendship.',
    "Wherever I end up after this... in whatever reality... all those moments between us were real, and they'll always be ours.",
    "Max... it's time...",
    "Max.....I'll always be with you.",
    "Do your powers include mind reading? Or did you just rewind because I tried to steal the cozy chair? Shit I'm confused...",
    "Max Caulfield... Don't you forget about me!",
    'This is bullshit! Fuck you, door!',
  ],
}

export class InteractionsStore {
  public async handleDiscordInteraction(req: express.Request) {
    const message = req.body
    if (message.type === InteractionType.APPLICATION_COMMAND) {
      let quote: string = ''
      if (message.data && message.data.options) {
        const character = message.data.options[0].value as
          | 'max_caulfield'
          | 'chloe_price'

        quote = this.random(quotes[character])
      } else {
        const character = this.random(['max_caulfield', 'chloe_price']) as
          | 'max_caulfield'
          | 'chloe_price'

        quote = this.random(quotes[character])
      }

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: quote,
        },
      }
    }

    return
  }

  private random = (array: Array<string>): string =>
    array[Math.floor(Math.random() * array.length)]
}
