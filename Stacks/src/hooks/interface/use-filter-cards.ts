import { useEffect, useState } from 'react';

import { PropertyStatus, PropertyType } from '@/data';

import { useArwaUser } from '../blockchain/manager/use-arwa-user';

export const useFilterCards = (category: string): PropertyType[] => {
  const { verifierProperties } = useArwaUser();

  const [property, setProperty] = useState<PropertyType[]>(verifierProperties);

  useEffect(() => {
    switch (Number(category)) {
      case 0: {
        return setProperty(verifierProperties);
      }
      case 1: {
        return setProperty(
          verifierProperties.filter(
            (element) => element.status === PropertyStatus.Accepted,
          ),
        );
      }
      case 2: {
        return setProperty(
          verifierProperties.filter(
            (element) =>
              element.status === PropertyStatus.Pending ||
              element.status === PropertyStatus.Shipped,
          ),
        );
      }
      case 3: {
        return setProperty(
          verifierProperties.filter(
            (element) =>
              element.status === PropertyStatus.Canceled ||
              element.status === PropertyStatus.Rejected,
          ),
        );
      }
      case 4: {
        return setProperty(
          verifierProperties.filter(
            (element) => element.isRental === true,  // Filter for rental properties
          ),
        );
      }
      default: {
        return setProperty(verifierProperties);
      }
    }
  }, [category, verifierProperties]);

  return property;
};
