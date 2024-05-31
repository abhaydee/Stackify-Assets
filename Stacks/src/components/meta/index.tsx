import { ReactElement } from 'react';
import NextHead from 'next/head';

import appInfo from '../../../app-info.json';

type PropertiesType = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

const defaults: PropertiesType = {
  title: `${appInfo.name} ${appInfo.version}`,
  description: appInfo.name,
  image: `${process.env.NEXT_PUBLIC_SELF_URL_BASE}/assets/cover.png`,
  url: `${process.env.NEXT_PUBLIC_SELF_URL_BASE}`,
};

export const Meta = (properties: PropertiesType): ReactElement => {
  const metaData: PropertiesType = { ...defaults, ...properties };
  return (
    <NextHead>
      <title>{metaData?.title}</title>
      <meta name="description" key={'desc'} content={metaData?.description} />

      {/*<!-- Google / Search Engine Tags -->*/}
      <meta itemProp="name" content={metaData?.title} />
      <meta itemProp="description" content={metaData?.description} />
      <meta itemProp="image" content={metaData?.image} />

      {/*<!-- Facebook Meta Tags -->*/}
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content={metaData?.title} />
      <meta property="og:title" content={metaData?.title} />
      <meta property="og:description" content={metaData?.description} />
      <meta property="og:image" content={metaData?.image} />
      <meta property="og:url" content={metaData?.url} />
      <meta property="og:type" content="website" />
      <meta property="og:image:width" content="467" />
      <meta property="og:image:height" content="263" />
      {/*<!-- Twitter Meta Tags -->*/}
      <meta name="twitter:title" key={'ttitle'} content={metaData?.title} />
      <meta
        name="twitter:description"
        key={'tdesc'}
        content={metaData?.description}
      />
      <meta name="twitter:image" key={'timg'} content={metaData?.image} />
      <meta name="twitter:card" key={'tcard'} content="summary_large_image" />
      <meta name="twitter:site" content={metaData?.url} />
      <meta name="twitter:creator" content={metaData?.url} />
    </NextHead>
  );
};
