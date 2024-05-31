import React from 'react';
import { Input } from '@nextui-org/input';

interface ICustomInput {
  type?: React.HTMLInputTypeAttribute | undefined;
  label?: string | undefined;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
  value?: string;
  error?: boolean | undefined;
  style?: React.CSSProperties | undefined;
  errorMessage?: string | undefined;
}

const CustomInput: React.FC<ICustomInput> = (properties) => {
  const { type, label, onChange, error, value, style, errorMessage } =
    properties;

  return (
    <Input
      type={type || 'text'}
      label={label}
      labelPlacement={'outside'}
      className={`${style} font-orbitron`}
      variant="bordered"
      onChange={onChange}
      value={value}
      isInvalid={error}
      errorMessage={error && errorMessage}
      classNames={{
        label: 'text-white/50 dark:text-white/90',
        input: [
          'text-white/90',
          'placeholder:text-default-700/50 dark:placeholder:text-white',
        ],
        inputWrapper: [
          'bg-default-800/50',
          'border-zinc-600',
          'dark:bg-default/60',
          'hover:bg-default-700/70',
          'dark:hover:bg-default/70',
          'group-data-[focused=true]:bg-default-700/50',
          'dark:group-data-[focused=true]:bg-default/60',
          '!cursor-text',
        ],
      }}
    />
  );
};

export default CustomInput;
