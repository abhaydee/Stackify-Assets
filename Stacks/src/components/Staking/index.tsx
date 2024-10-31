import { useState, useEffect } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  FungibleConditionCode,
  createAssetInfo,
  makeStandardFungiblePostCondition,
} from '@stacks/transactions';
import { useStacks } from '@stacks/connect-react';
import styles from './styles.module.scss';

const Staking = () => {
  const { network, address } = useStacks();
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('144'); // Default 1 day
  const [stakingPosition, setStakingPosition] = useState(null);
  const [totalStaked, setTotalStaked] = useState('0');
  const [rewards, setRewards] = useState('0');

  useEffect(() => {
    fetchStakingData();
  }, [address]);

  const fetchStakingData = async () => {
    if (!address) return;

    try {
      // Fetch staking position
      const positionResponse = await callReadOnlyFunction({
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName: 'infinitystacks',
        functionName: 'get-staking-position',
        functionArgs: [principalCV(address)],
        network,
      });
      setStakingPosition(positionResponse.value);

      // Fetch total staked
      const totalStakedResponse = await callReadOnlyFunction({
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName: 'infinitystacks',
        functionName: 'get-total-staked',
        functionArgs: [],
        network,
      });
      setTotalStaked(totalStakedResponse.value);
    } catch (error) {
      console.error('Error fetching staking data:', error);
    }
  };

  const handleStake = async () => {
    const amount = uintCV(Number(stakeAmount));
    const period = uintCV(Number(lockPeriod));

    const postCondition = makeStandardFungiblePostCondition(
      address!,
      FungibleConditionCode.Equal,
      amount.value,
      createAssetInfo('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'infinitystacks', 'thetix-USD')
    );

    await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'infinitystacks',
      functionName: 'stake-tokens',
      functionArgs: [amount, period],
      postConditions: [postCondition],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      onFinish: () => {
        fetchStakingData();
        setStakeAmount('');
      },
    });
  };

  const handleClaimRewards = async () => {
    await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'infinitystacks',
      functionName: 'claim-rewards',
      functionArgs: [],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: fetchStakingData,
    });
  };

  const handleUnstake = async () => {
    await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'infinitystacks',
      functionName: 'unstake-tokens',
      functionArgs: [],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: fetchStakingData,
    });
  };

  return (
    <div className={styles.stakingContainer}>
      <h2>Staking Dashboard</h2>
      
      <div className={styles.statsContainer}>
        <div className={styles.stat}>
          <label>Total Staked:</label>
          <span>{totalStaked} tUSD</span>
        </div>
        {stakingPosition && (
          <div className={styles.stat}>
            <label>Your Stake:</label>
            <span>{stakingPosition.amount} tUSD</span>
          </div>
        )}
      </div>

      <div className={styles.stakingForm}>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="Amount to stake"
          className={styles.input}
        />
        <select
          value={lockPeriod}
          onChange={(e) => setLockPeriod(e.target.value)}
          className={styles.select}
        >
          <option value="144">1 Day</option>
          <option value="1008">1 Week</option>
          <option value="4320">1 Month</option>
        </select>
        <button onClick={handleStake} className={styles.button}>
          Stake
        </button>
      </div>

      <div className={styles.actions}>
        <button onClick={handleClaimRewards} className={styles.button}>
          Claim Rewards
        </button>
        <button onClick={handleUnstake} className={styles.button}>
          Unstake
        </button>
      </div>
    </div>
  );
};

export default Staking; 