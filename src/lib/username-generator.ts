import { customAlphabet } from 'nanoid';

const adjectives = [
  'Quantum', 'Cosmic', 'Mystic', 'Stellar', 'Thunder', 'Shadow', 'Crystal', 'Solar',
  'Lunar', 'Astral', 'Phoenix', 'Nebula', 'Cyber', 'Echo', 'Vector', 'Nova',
  'Prism', 'Pulse', 'Storm', 'Flux'
];

const nouns = [
  'Sentinel', 'Guardian', 'Knight', 'Warrior', 'Hunter', 'Sage', 'Oracle', 'Phantom',
  'Voyager', 'Ranger', 'Titan', 'Nomad', 'Paladin', 'Seeker', 'Warden', 'Champion',
  'Defender', 'Scout', 'Valiant', 'Beacon'
];

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 4);

export function generateUsername(seed?: string): string {
  // If no seed is provided or it's invalid, generate a random combination
  if (!seed) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const suffix = nanoid();
    return `${adj}${noun}${suffix}`;
  }

  // Use the seed to generate a consistent name for the same peer ID
  const hashCode = seed.split('').reduce((acc, char) => {
    const hash = ((acc << 5) - acc) + char.charCodeAt(0);
    return hash & hash;
  }, 0);

  const adjIndex = Math.abs(hashCode) % adjectives.length;
  const nounIndex = Math.abs(hashCode >> 8) % nouns.length;
  const suffix = seed.slice(-4).toUpperCase();

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${suffix}`;
}

export function shortenPeerId(peerId: string): string {
  if (peerId.length <= 8) return peerId;
  return `${peerId.slice(0, 4)}...${peerId.slice(-4)}`;
}