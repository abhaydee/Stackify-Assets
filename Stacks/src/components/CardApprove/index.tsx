import { memo, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@nextui-org/button';
import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { Image } from '@nextui-org/image';
import { Input } from '@nextui-org/input';
import { Link } from '@nextui-org/link';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table';
import { useNetwork } from 'wagmi';
import * as Yup from 'yup';

import { PropertyType, StatusToText } from '@/data';
import { useProperty } from '@/hooks/blockchain/manager/use-property';
import { useVerifierActions } from '@/hooks/blockchain/manager/use-verifier-actions';
import { StatusToColor } from '@/utils';

import Skeleton from '../Skeleton';

type TCardProfile = {
  id: number;
};

type FormState = {
  amount: string;
};

const ethToWei = 1_000_000_000_000_000_000;

const schemaUser = Yup.object().shape({
  amount: Yup.string()
    // eslint-disable-next-line security/detect-unsafe-regex
    .matches(/(?<!-)(?<!\d)[1-9]\d*(?:\.\d{0,2})?/)
    // eslint-disable-next-line no-magic-numbers
    .max(14)
    .min(1)
    .required(),
});

const CardApprove: React.FC<TCardProfile> = ({ id }): JSX.Element => {
  const { push } = useRouter();
  const { chain } = useNetwork();

  const { getPropertyInfo } = useProperty();
  const { acceptProperty: _acceptProperty, rejectProperty: _rejectProperty } =
    useVerifierActions();

  const [load, setload] = useState(false);
  const [property, setProperty] = useState<PropertyType>({} as PropertyType);

  const loaded = property !== undefined;

  const {
    control,
    formState: { errors, isValid },
    getValues,
  } = useForm<FormState>({
    resolver: yupResolver(schemaUser),
    mode: 'onChange',
  });

  const acceptProperty = async (): Promise<void> => {
    const notification = toast.loading('Acceptance...');
    try {
      const { hash } = await _acceptProperty(
        id,
        Number(getValues('amount')) * ethToWei,
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
  };

  const rejectProperty = async (): Promise<void> => {
    const notification = toast.loading('Rejection...');
    try {
      const hash = await _rejectProperty(id);
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
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const handleLoad = (info): void => {
    if (info) {
      setload(true);
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

  return (
    <Card
      shadow="sm"
      onPress={(): void => console.log('item pressed')}
      className="w-full bg-[var(--main-card-color)] cursor-default "
    >
      <CardHeader className="text-[var(--main-text-color)] text-3xl pl-5">
        Verify tokens
      </CardHeader>
      <CardBody className="flex-col items-start gap-10 dark">
        {loaded && (
          <Table
            isStriped
            hideHeader
            shadow="lg"
            aria-label="Example static collection table"
            classNames={{ wrapper: 'bg-[var(--main-card-color)]' }}
          >
            <TableHeader>
              <TableColumn>type</TableColumn>
              <TableColumn>value</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow key="1">
                <TableCell className="w-1/2">
                  <p className="text-default-500 text-xl  sm:text-3xl truncate ...">
                    {property.name}
                  </p>
                </TableCell>
                <TableCell>
                  <Button
                    color={StatusToColor[property.status]}
                    className="w-full sm:w-1/2"
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
                  <p className="text-default-500 text-xl sm:text-3xl">
                    Symbol:
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-white text-xl sm:text-3xl">
                    {' '}
                    {property.symbol}
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, value } }): JSX.Element => (
            <Input
              isRequired
              type="number"
              label="Price"
              placeholder="0.00"
              labelPlacement="outside"
              onChange={onChange}
              value={value}
              isInvalid={Boolean(errors.amount)}
              classNames={{
                label: 'text-2xl',
                input: 'text-2xl text-white/70',
                inputWrapper: 'h-12',
              }}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-2xl">STX</span>
                </div>
              }
            />
          )}
          name="amount"
        />
      </CardBody>
      <CardFooter className="flex-row gap-10 pl-5 mb-5">
        <Button
          color="success"
          size="lg"
          isDisabled={!isValid}
          onPress={acceptProperty}
        >
          Accept
        </Button>
        <Button color="danger" size="lg" onPress={rejectProperty}>
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
};

export default memo(CardApprove);
