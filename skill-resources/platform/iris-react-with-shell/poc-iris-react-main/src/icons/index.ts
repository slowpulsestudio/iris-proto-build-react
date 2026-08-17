import manifest from './manifest.json' with { type: 'json' };

export interface IconEntry {
  name: string;
  category: string;
  svg: string;
}

export { manifest };
export const icons: IconEntry[] = manifest.icons as IconEntry[];
export * from './icons/index';
