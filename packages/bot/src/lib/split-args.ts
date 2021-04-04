export const splittyArgs = (args: string): Array<string> => {
  return args.split(' ').filter((x) => x.trim().length !== 0)
}
