import { content } from '../../content';
import type { BackgroundResidentId } from '../characters';
import type { Profile } from './model';

const residents: Profile[] = content.characters.map(character => ({
  id: character.id, kind: 'resident', speed: character.id === 'zhang-laoshi' ? .65 : .95,
  radius: .22, dwellMs: character.id === 'xiao-li' ? 6500 : 14000,
  resting: character.id === 'zhang-laoshi' ? 'sit' : character.id === 'lin-jie' ? 'work' : 'idle',
  greeting: character.greeting,
}));
type BackgroundProfile = Omit<Profile, 'id' | 'greeting'> & { id: BackgroundResidentId; greeting?: never };
export const backgroundProfiles: readonly BackgroundProfile[] = [
  { id: 'resident-reader', kind: 'resident', homeMap: 'park', speed: .58, radius: .22, dwellMs: 22000, resting: 'sit', restingFacing: 'south' },
  { id: 'resident-courier', kind: 'resident', homeMap: 'town', speed: 1.15, radius: .22, dwellMs: 6500, resting: 'work', restingFacing: 'north' },
  { id: 'resident-groundskeeper', kind: 'resident', homeMap: 'park', speed: .7, radius: .22, dwellMs: 17000, resting: 'work', restingFacing: 'east' },
  { id: 'resident-laundry-neighbour', kind: 'resident', homeMap: 'courtyard', speed: .65, radius: .22, dwellMs: 19000, resting: 'work', restingFacing: 'north' },
  { id: 'resident-river-walker', kind: 'resident', homeMap: 'riverbank', speed: .85, radius: .22, dwellMs: 12500, resting: 'idle', restingFacing: 'east' },
];
const allProfiles: Profile[] = [
  ...residents,
  ...backgroundProfiles,
  { id: 'aunt', kind: 'resident', speed: .8, radius: .22, dwellMs: 18000, resting: 'work' },
  { id: 'white-cat', kind: 'cat', speed: .75, radius: .16, dwellMs: 9000, resting: 'sit' },
  { id: 'black-cat', kind: 'cat', speed: .6, radius: .16, dwellMs: 16000, resting: 'sit' },
  { id: 'bird', kind: 'bird', speed: 1.5, radius: .1, dwellMs: 5000, resting: 'perch' },
];
export const profiles: ReadonlyMap<string, Profile> = new Map(allProfiles.map(profile => [profile.id, profile]));

const aliases: Record<string, string> = { 'cats.white': 'white-cat', 'cats.black': 'black-cat', sparrow: 'bird', glasses: 'zhang-laoshi', backpack: 'xiao-zhou', bun: 'lin-jie', tie: 'xiao-li' };
export function profileFor(characterId: string): Profile | undefined {
  return profiles.get(aliases[characterId] ?? characterId);
}
