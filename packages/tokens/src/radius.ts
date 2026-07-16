/** Sharp reads as legal (Blueprint §11.4). Brand tile radius is a locked %. */
export const radius = {
  image: '0px',
  control: '4px',
  card: '8px',
  chip: '999px',
  tile: '22%',
} as const;
export type RadiusToken = keyof typeof radius;
