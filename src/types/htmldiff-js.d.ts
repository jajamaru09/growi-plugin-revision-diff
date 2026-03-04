declare module 'htmldiff-js' {
  const htmldiff: {
    execute(oldText: string, newText: string): string;
  };
  export default htmldiff;
}
