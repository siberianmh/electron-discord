export const splittyArgs = (args: string): string[] => {
  return args.split(' ').filter((x) => x.trim().length !== 0)
}
