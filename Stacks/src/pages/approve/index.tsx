import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import CardApprove from '@/components/CardApprove';

const Approve: FC = () => {
  const [isClient, setIsClient] = useState(false);
  const { query } = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <>{isClient && <CardApprove id={Number(query.id)} />}</>;
};

export default Approve;
