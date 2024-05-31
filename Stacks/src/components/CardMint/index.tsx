import { memo, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@nextui-org/button';
import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { Input } from '@nextui-org/input';
import { Tooltip } from '@nextui-org/tooltip';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import * as Yup from 'yup';

import { PropertyType } from '@/data';
import { useProperty } from '@/hooks/blockchain/manager/use-property';
import { adressLenght, ethToWei, sumCost } from '@/utils';

import CardMintTable from '../CardMintTable';

type TCardProfile = {
  id: number;
};

type FormState = {
  amount: string;
};

const schemaUser = Yup.object().shape({
  amount: Yup.string().matches(/^\d+$/).max(adressLenght).min(1).required(),
});

const CardMint: React.FC<TCardProfile> = ({ id }): JSX.Element => {
  const { chain } = useNetwork();

  const { push } = useRouter();
  const { address } = useAccount();
  const { data } = useBalance({ address });

  const { getPropertyInfo, getPropertyCollectionInfo } = useProperty();
  const { mintTokens } = useProperty();

  const [property, setProperty] = useState<PropertyType>();
  const [propertyCollection, setPropertyCollection] = useState<{
    maxSupply: number;
    propertryPrice: number;
  }>();

  const loaded = property !== undefined && propertyCollection !== undefined;

  const {
    control,
    formState: { errors, isValid },
    getValues,
  } = useForm<FormState>({
    resolver: yupResolver(schemaUser),
    mode: 'onChange',
  });

  const mint = async (): Promise<void> => {
    const notification = toast.loading('Minting....');
    if (property) {
      try {
        const hash = await mintTokens(
          property.collectionAddress,
          Number(getValues('amount')),
        );
        push('/profile');
        toast.success(
          <Link
            className="text-black text-ellipsis underline"
            href={`${chain?.blockExplorers?.default.url}/tx/${hash}`}
            target="_blank"
          >
            Link to hash
          </Link>,
          {
            id: notification,
            duration: 10_000,
          },
        );
        console.info('contract call success', hash);
      } catch (error) {
        toast.error('Whoops something went wrong!', {
          id: notification,
        });

        console.error('contract call failure', error);
      }
    }
  };

  useEffect(() => {
    const propertyInfo = async (): Promise<void> => {
      const result = await getPropertyInfo(id);
      setProperty(result);
    };
    if (id || id === 0) {
      propertyInfo();
    }
  }, [id]);

  useEffect(() => {
    if (property) {
      const propertyCollectionFunction = async (): Promise<void> => {
        const result = await getPropertyCollectionInfo(
          property.collectionAddress,
        );
        setPropertyCollection(result);
      };
      propertyCollectionFunction();
    }
  }, [property]);

  return (
    <Card
      shadow="sm"
      className="w-full bg-[var(--main-card-color)] cursor-default"
    >
      <CardHeader className="text-[var(--main-text-color)] text-3xl pl-5">
        Mint your tokens
      </CardHeader>
      <CardBody className="flex-col items-start gap-10 dark">
        {loaded && (
          <CardMintTable
            property={property}
            propertyCollection={propertyCollection}
          />
        )}
        <div className="gap-2 flex flex-col w-max">
          {loaded && (
            <Controller
              control={control}
              render={({ field: { onChange, value } }): JSX.Element => (
                <Input
                  isRequired
                  type="number"
                  label={
                    <Tooltip
                      key={'foreground'}
                      color={'foreground'}
                      content={
                        'Supply cost on tokens: 100(ETH) / 20* = 5 (ETH)'
                      }
                      className="dark"
                      placement="top-start"
                      radius="sm"
                    >
                      <Button
                        variant="flat"
                        className="bg-transparent text-3xl w-auto items-start justify-start p-0"
                      >
                        Supply
                      </Button>
                    </Tooltip>
                  }
                  placeholder="0"
                  labelPlacement="outside"
                  onChange={onChange}
                  value={value}
                  isInvalid={Boolean(errors.amount)}
                  classNames={{
                    label: 'text-2xl',
                    input: 'text-2xl text-white/70 w-min ',
                    inputWrapper: 'h-12 m-0 ',
                  }}
                  startContent={
                    <p className="text-white text-3xl">
                      {propertyCollection.propertryPrice / ethToWei}{' '}
                      STX /
                    </p>
                  }
                  endContent={
                    <p className="text-white text-3xl w-auto">
                      = {sumCost(propertyCollection, getValues('amount'))}{' '}
                      STX per token
                    </p>
                  }
                />
              )}
              name="amount"
            />
          )}
        </div>
      </CardBody>
      <CardFooter className="pl-5 mb-5">
        <Button
          color="success"
          size="lg"
          isDisabled={!isValid}
          onPress={mint}
          className="w-1/4"
        >
          Mint
        </Button>
      </CardFooter>
    </Card>
  );
};

export default memo(CardMint);
