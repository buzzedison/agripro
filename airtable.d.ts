declare module 'airtable' {
  export default class Airtable {
    constructor(options?: { apiKey?: string });
    base(baseId: string): any;
    static configure(options: { apiKey: string; endpointUrl: string }): void;
  }
}