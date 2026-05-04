import { Region } from '../enums/region';

export class Location {
  constructor(
    public readonly city: string,
    public readonly state: string,
    public readonly region: Region,
  ) {}
}
