import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import CardMint from '@/components/CardMint';

const Mint: FC = () => {
  const [isClient, setIsClient] = useState(false);
  const { query } = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <>{isClient && <CardMint id={Number(query.id)} />}</>;
};

export default Mint;
