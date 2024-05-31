// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-date-now */

import { PropertyStatus } from '@/data';

export const ethToWei = 1_000_000_000_000_000_000;
export const adressLenght = 6;

export const startAndEnd = (
  string_: string | undefined,
  gap: number,
): string | undefined => {
  const lngth = 30;
  const gapMin = 0;
  if (string_ && string_.length > lngth) {
    return `${string_.slice(gapMin, Math.max(0, gap))}...${string_.slice(
      string_.length - gap,
      string_.length - gap + string_.length,
    )}`;
  }
  return string_;
};

type ColorsNext =
  | 'default'
  | 'danger'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | undefined;

export const StatusToColor: Record<PropertyStatus, ColorsNext> = {
  [PropertyStatus.Pending]: 'warning',
  [PropertyStatus.Shipped]: 'warning',
  [PropertyStatus.Accepted]: 'success',
  [PropertyStatus.Rejected]: 'danger',
  [PropertyStatus.Canceled]: 'danger',
};

export const sumCost = (
  propertyCollection: {
    maxSupply: number;
    propertryPrice: number;
  },
  value: string | undefined,
): string => {
  if (propertyCollection) {
    if (value === undefined || value === '' || value === '0') {
      return '0';
    }
    return Number.parseFloat(
      String(propertyCollection.propertryPrice / ethToWei / Number(value)),
    ).toFixed(4);
  }
  return '0';
};
