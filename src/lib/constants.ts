export const AVATAR_STYLES = ['lorelei', 'notionists', 'adventurer-neutral', 'pixel-art'];

export const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Mason', 'Lilly', 'Jack', 
  'Mia', 'Leo', 'Zoe', 'Toby', 'Sasha',
  'Jasper', 'Bella', 'Oliver', 'Sophie', 'Bear'
];

export const generateDiceBearUrl = (style: string, seed: string) => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
};

export const DEFAULT_AVATARS = [
  generateDiceBearUrl('lorelei', 'Felix'),
  generateDiceBearUrl('lorelei', 'Aneka'),
  generateDiceBearUrl('notionists', 'Mason'),
  generateDiceBearUrl('notionists', 'Lilly'),
  generateDiceBearUrl('adventurer-neutral', 'Jack'),
  generateDiceBearUrl('adventurer-neutral', 'Mia'),
  generateDiceBearUrl('pixel-art', 'Leo'),
  generateDiceBearUrl('pixel-art', 'Zoe'),
];
