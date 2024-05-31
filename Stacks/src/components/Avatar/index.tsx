import { FC, useMemo } from 'react';
import Image from 'next/image';
import { identicon } from '@dicebear/collection';
import { createAvatar, Options } from '@dicebear/core';

interface AvatarProperties {
  profileImage: string;
  size?: number;
  className?: string;
}

const Avatar: FC<AvatarProperties> = ({
  profileImage: seed,
  size,
  className,
}) => {
  const standartSize = 30;
  const avatar = useMemo(() => {
    const options: Partial<Options> = {
      seed,
      size: size || standartSize,
    };

    return createAvatar(identicon, options).toDataUriSync();
  }, [seed]);

  return (
    <Image
      src={seed.includes('/') ? seed : avatar}
      alt="Avatar"
      width={size || standartSize}
      height={size || standartSize}
      className={className}
    />
  );
};

export default Avatar;
