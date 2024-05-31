import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@nextui-org/button';
import { Card } from '@nextui-org/card';
import { Input } from '@nextui-org/input';
import { motion } from 'framer-motion';
import { useNetwork } from 'wagmi';

import { useProperty } from '@/hooks/blockchain/manager/use-property';
import { useKycManager } from '@/hooks/blockchain/use-kyc-manager';

import styles from './styles.module.scss';

import documentIcon from '/public/assets/doc.svg';

const Create: React.FC = () => {
  const { createProperty } = useProperty();
  const { isKycPassed, isLoading, updateKyc } = useKycManager();
  const { chain } = useNetwork();

  const [isClient, setIsClient] = useState(false);
  const [userName, setUserName] = useState('');
  const [surname, setSurname] = useState('');
  const [image, setImage] = useState<string>('');
  const [collectionName, setCollectionName] = useState('');
  const [documentReference, setDocumentReference] = useState('');
  const [collectionSymbol, setCollectionSymbol] = useState('');

  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { name, value } = event.target;
    switch (name) {
      case 'userName': {
        setUserName(value);
        break;
      }
      case 'surname': {
        setSurname(value);
        break;
      }
      case 'collectionName': {
        setCollectionName(value);
        break;
      }
      case 'documentReference': {
        setDocumentReference(value);
        break;
      }
      case 'collectionSymbol': {
        setCollectionSymbol(value);
        break;
      }
      default: {
        break;
      }
    }
  };

  const handleCreateProperty = async (): Promise<void> => {
    const notification = toast.loading('Creating a request...');
    try {
      const hash = await createProperty(
        collectionName,
        documentReference,
        collectionSymbol,
      );

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

  const validateText = (value: string): boolean => {
    const textPattern = /^[A-Za-z]+$/;
    return textPattern.test(value);
  };

  const validateTextAndNumbers = (value: string): boolean => {
    const textPattern = /^[\dA-Za-z]+$/;
    return textPattern.test(value);
  };

  const validateURL = (value: string): boolean => {
    const urlPattern = /^(https?|ftp):\/\/[^\s#$./?].\S*$/i;
    return urlPattern.test(value);
  };
  const isInvalid = (
    value: string,
    pattern: (value: string) => boolean,
  ): boolean => {
    if (value === '') return false;
    return !pattern(value);
  };

  const isInvalidCollectionName = isInvalid(
    collectionName,
    validateTextAndNumbers,
  );
  const isInvalidCollectionSymbol = isInvalid(collectionSymbol, validateText);
  const isInvalidName = isInvalid(userName, validateText);
  const isInvalidSurname = isInvalid(surname, validateText);
  const isInvalidUrl = isInvalid(documentReference, validateURL);

  const handleClick = (): void => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const changePhoto = (event): void => {
    event.preventDefault();
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.onloadend = (): void => {
      setImage(reader.result ? reader.result.toString() : '');
    };
    reader.readAsDataURL(file);
  };

  const disableCreateButton =
    !isKycPassed ||
    !collectionName ||
    !documentReference ||
    !collectionSymbol ||
    isInvalidCollectionSymbol ||
    isInvalidCollectionName ||
    isInvalidUrl;

  const disableKYCButton = !userName || !surname || !image;
  const errorMessage = 'Please enter valid text (only letters)';
  const errorMessageCollectionName =
    'Please enter valid text (only letters and numbers)';

  return (
    <div>
      {isClient && (
        <div className="mx-2 flex flex-col">
          <div className={styles.kycContainer}>
            {isLoading ? (
              <div
                className={`mb-4 ${
                  isKycPassed
                    ? 'bg-gray-500 w-1/2 sm:w-1/3 h-40'
                    : 'bg-gray-500 h-96'
                } flex items-center justify-center animate-pulse rounded-2xl`}
              >
                <p className="text-center ">Loading...</p>
              </div>
            ) : (
              <Card
                className={`mb-4 ${
                  isKycPassed
                    ? 'bg-green-500 w-1/2 sm:w-1/3 h-40'
                    : 'bg-red-500'
                }`}
              >
                <div className={`p-4 rounded-md font-orbitron`}>
                  {isKycPassed ? (
                    <p>KYC passed!</p>
                  ) : (
                    <>
                      <p>KYC not passed. Enter the data to pass KYC.</p>
                      <motion.div
                        whileHover={{ opacity: 0.7 }}
                        onClick={handleClick}
                        className={styles.motion}
                      >
                        <div>
                          <Image
                            src={documentIcon}
                            alt="Avatar"
                            width={150}
                            height={150}
                            className={styles.avatarContainer}
                          />
                          <input
                            onChange={changePhoto}
                            type="file"
                            style={{ display: 'none' }}
                            ref={hiddenFileInput}
                          />
                        </div>
                      </motion.div>
                      <Input
                        name="userName"
                        label="Name"
                        value={userName}
                        onChange={handleInputChange}
                        isInvalid={isInvalidName}
                        errorMessage={
                          isInvalidName && (
                            <p className="text-black">{errorMessage}</p>
                          )
                        }
                        className="my-4 text-black"
                      />
                      <Input
                        name="surname"
                        label="Surname"
                        value={surname}
                        onChange={handleInputChange}
                        isInvalid={isInvalidSurname}
                        errorMessage={
                          isInvalidSurname && (
                            <p className=" text-black">{errorMessage}</p>
                          )
                        }
                        className="my-4  text-black"
                      />
                      <Button
                        onClick={updateKyc}
                        className={`${
                          disableKYCButton ? 'bg-red-700' : 'bg-green-500'
                        } mt-4`}
                        disabled={disableKYCButton}
                      >
                        Pass KYC
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>
          <Input
            name="collectionName"
            label="Collection name"
            value={collectionName}
            onChange={handleInputChange}
            className="my-4 text-gray-700"
            isInvalid={isInvalidCollectionName}
            errorMessage={isInvalidCollectionName && errorMessageCollectionName}
            isDisabled={!isKycPassed}
          />
          <Input
            name="documentReference"
            label="Document reference"
            value={documentReference}
            onChange={handleInputChange}
            className="my-4 text-gray-700"
            isInvalid={isInvalidUrl}
            errorMessage={isInvalidUrl && 'Please enter a valid URL'}
            isDisabled={!isKycPassed}
          />
          <Input
            name="collectionSymbol"
            label="Collection symbol"
            value={collectionSymbol}
            onChange={handleInputChange}
            className="my-4 text-gray-700"
            isInvalid={isInvalidCollectionSymbol}
            errorMessage={isInvalidCollectionSymbol && errorMessage}
            isDisabled={!isKycPassed}
          />

          <Button
            onClick={handleCreateProperty}
            className={`${
              disableCreateButton ? 'bg-red-500' : 'bg-green-500'
            } mt-4`}
            isDisabled={disableCreateButton}
          >
            Create request
          </Button>
        </div>
      )}
    </div>
  );
};

export default Create;
