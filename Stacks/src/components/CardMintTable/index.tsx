import React, { memo, useState } from 'react';
import { Button } from '@nextui-org/button';
import { Image } from '@nextui-org/image';
import { Link } from '@nextui-org/link';
import { Skeleton } from '@nextui-org/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table';

import { PropertyType, StatusToText } from '@/data';
import { adressLenght, ethToWei, startAndEnd, StatusToColor } from '@/utils';

type TCardMintTable = {
  property: PropertyType;
  propertyCollection: {
    maxSupply: number;
    propertryPrice: number;
  };
};

const CardMintTable: React.FC<TCardMintTable> = ({
  property,
  propertyCollection,
}): JSX.Element => {
  const [load, setload] = useState(false);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const handleLoad = (info): void => {
    if (info) {
      setload(true);
    }
  };

  return (
    <Table
      isStriped
      hideHeader
      shadow="lg"
      aria-label="Example static collection table"
      classNames={{ wrapper: 'bg-[var( --main-card-color)]' }}
    >
      <TableHeader>
        <TableColumn>type</TableColumn>
        <TableColumn>value</TableColumn>
      </TableHeader>
      <TableBody>
        <TableRow key="1">
          <TableCell className="w-1/2">
            <p className="text-default-500 text-xl sm:text-3xl truncate ...">
              {property.name}
            </p>
          </TableCell>
          <TableCell>
            <Button
              color={StatusToColor[property.status]}
              className="w-1/8 sm:w-1/2"
              disabled
            >
              {StatusToText[property.status]}
            </Button>
          </TableCell>
        </TableRow>
        <TableRow key="2">
          <TableCell>
            <p className="text-default-500 text-xl sm:text-3xl">Image:</p>
          </TableCell>
          <TableCell className="overflow-visible p-3 shadow-lg">
            <Skeleton isLoaded={load}>
              <Image
                removeWrapper
                radius="lg"
                alt={'home'}
                className="z-0 w-6/12	 h-w-6/12	 object-cover"
                src="https://images.unsplash.com/photo-1530734218972-25a9391ccd8b?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                onLoad={handleLoad}
                width={100}
                height={65}
              />
            </Skeleton>
          </TableCell>
        </TableRow>
        <TableRow key="3">
          <TableCell>
            <p className="text-default-500 text-xl sm:text-3xl">
              Link to docs:
            </p>
          </TableCell>
          <TableCell>
            <Link
              isBlock
              showAnchorIcon
              href={property.docs}
              color="primary"
              className="text-xl sm:text-3xl"
              target={'_blank'}
            >
              Redirect to docs
            </Link>
          </TableCell>
        </TableRow>
        <TableRow key="4">
          <TableCell>
            <p className="text-default-500 text-xl sm:text-3xl">Symbol:</p>
          </TableCell>
          <TableCell>
            <p className="text-white text-xl sm:text-3xl"> {property.symbol}</p>
          </TableCell>
        </TableRow>
        <TableRow key="5">
          <TableCell>
            <p className="text-default-500 text-xl sm:text-3xl">
              Collection address:
            </p>
          </TableCell>
          <TableCell>
            <Link
              className="text-white text-ellipsis text-xl sm:text-3xl"
              href={`https://explorer.testnet.rootstock.io/address/${property.collectionAddress}`}
              target="_blank"
            >
              {startAndEnd(property.collectionAddress, adressLenght)}
            </Link>
          </TableCell>
        </TableRow>
        <TableRow key="6">
          <TableCell>
            <p className="text-default-500 text-xl sm:text-3xl">
              Property price:
            </p>
          </TableCell>
          <TableCell>
            <p className="text-white text-xl sm:text-3xl">
              {propertyCollection.propertryPrice / ethToWei} STX
            </p>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default memo(CardMintTable);
