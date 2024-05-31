import { ReactElement } from 'react';
import { useRouter } from 'next/router';

const SpotlightComponent = (): ReactElement => {
  const router = useRouter();
  return (
    <div>
      <div>
        <h1>Page not found</h1>
        <span>
          Hmm, the page you were looking for doesn’t seem to exist anymore
        </span>
        <button onClick={(): Promise<boolean> => router.push('/')}>
          Back to main page
        </button>
      </div>
    </div>
  );
};

export default SpotlightComponent;
