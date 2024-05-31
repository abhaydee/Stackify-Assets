import { useEffect, useState } from 'react';
import { Select, SelectItem } from '@nextui-org/select';
import { useNetwork, useSwitchNetwork } from 'wagmi';

const NetworkSwitcher = (): JSX.Element => {
  const { chain } = useNetwork();
  const { chains, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork(
    {
      onSuccess: (data) => {
        setSelectedChain(data);
      },
    },
  );
  const [selectedChain, setSelectedChain] = useState(chain);

  useEffect(() => {
    if (!isLoading && pendingChainId === undefined) {
      setSelectedChain(chain);
    }
  }, [chain, isLoading, pendingChainId]);

  const handleChange = (newChainId: number): void => {
    if (switchNetwork) {
      switchNetwork(newChainId);
    }
  };

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      {/* <Select
        label="Select chain"
        defaultSelectedKeys={[chain ? `${chain.id}` : '']}
        selectedKeys={[selectedChain ? `${selectedChain.id}` : '']}
        className="max-w-xs text-black"
        scrollShadowProps={{
          isEnabled: false,
        }}
        onSelectionChange={([newChainId]): void =>
          handleChange(Number(newChainId))
        }
        disabledKeys={[chain ? `${chain.id}` : '']}
      >
        {chains.map((netChain) => (
          <SelectItem
            key={netChain.id}
            value={netChain.name}
            style={{
              border: '1px solid #000',
              marginBlock: '10px',
              color: '#312c2c',
            }}
          >
            {netChain.name}
          </SelectItem>
        ))}
      </Select> */}

      {isLoading && pendingChainId && (
        <p
          style={{
            marginLeft: '5px',
          }}
        >
          Switching to {pendingChainId}...
        </p>
      )}
    </div>
  );
};
export default NetworkSwitcher;
