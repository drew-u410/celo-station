import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToastTxSuccess } from 'src/components/notifications/TxSuccessToast';
import { useToastError } from 'src/components/notifications/useToastError';
import { ConfirmationDetails, TxPlan } from 'src/features/transactions/types';
import { logger } from 'src/utils/logger';
import { capitalizeFirstLetter } from 'src/utils/strings';
import { TransactionReceipt } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

// TODO force chain switch to celo mainnet before sending txs
export function useWriteContractWithReceipt(
  description: string,
  onSuccess?: (receipt: TransactionReceipt) => any,
  showTxSuccessToast = false,
) {
  const {
    data: hash,
    error: writeError,
    isError: isWriteError,
    isPending,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: waitError,
    isError: isWaitError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    pollingInterval: 1000,
  });

  useToastError(
    writeError,
    `Error sending ${description} transaction, please check your wallet balance & settings.`,
  );
  useToastError(
    waitError,
    `Error confirming ${description} transaction, please ensure the transaction is valid.`,
  );
  useToastTxSuccess({
    isConfirmed,
    txHash: hash,
    message: `${capitalizeFirstLetter(description)} transaction is confirmed!`,
    enabled: showTxSuccessToast,
  });

  // Run onSuccess when tx is confirmed
  // Some extra state is needed to ensure this only runs once per tx
  const [hasRunOnSuccess, setHasRunOnSuccess] = useState(false);
  useEffect(() => {
    if (hash && receipt && isConfirmed && !hasRunOnSuccess && onSuccess) {
      setHasRunOnSuccess(true);
      onSuccess(receipt);
    }
  }, [hash, receipt, isConfirmed, hasRunOnSuccess, onSuccess]);
  useEffect(() => {
    if (!hash || !receipt || !isConfirmed) setHasRunOnSuccess(false);
  }, [hash, receipt, isConfirmed]);

  return {
    hash,
    isError: isWriteError || isWaitError,
    isLoading: isPending || isConfirming,
    isConfirmed,
    writeContract,
  };
}

// Some flows require multiple transactions to be sent in a specific order.
// This hook allows us to track the progress of a multi-transaction flow.
export function useTransactionPlan<FormValues>({
  createTxPlan,
  onStepSuccess,
  onPlanSuccess,
}: {
  createTxPlan: (v: FormValues) => TxPlan;
  onStepSuccess?: (receipt: TransactionReceipt) => any;
  onPlanSuccess?: (v: FormValues, receipt: TransactionReceipt) => any;
}) {
  const [txPlan, setTxPlan] = useState<TxPlan | undefined>(undefined);
  const [formValues, setFormValues] = useState<FormValues | undefined>(undefined);
  const [txPlanIndex, setTxPlanIndex] = useState(0);
  const isPlanStarted = txPlanIndex > 0;

  const getTxPlan = useCallback(
    (v: FormValues) => {
      if (txPlan) return txPlan;
      const plan = createTxPlan(v);
      setTxPlan(plan);
      setFormValues(v);
      return plan;
    },
    [txPlan, createTxPlan],
  );

  const getNextTx = useCallback(
    (v: FormValues): any => {
      return getTxPlan(v)[txPlanIndex];
    },
    [getTxPlan, txPlanIndex],
  );

  const numTxs = useMemo(() => (txPlan ? txPlan.length : 0), [txPlan]);

  const onTxSuccess = useCallback(
    (receipt: TransactionReceipt) => {
      if (!formValues) throw new Error('onTxSuccess:formValues is undefined');
      logger.debug(`Executing onSuccess for tx ${txPlanIndex + 1} of ${numTxs}`);
      if (onStepSuccess) onStepSuccess(receipt);
      if (txPlanIndex >= numTxs - 1) {
        setTxPlan(undefined);
        setTxPlanIndex(0);
        if (onPlanSuccess) onPlanSuccess(formValues, receipt);
      } else {
        setTxPlanIndex(txPlanIndex + 1);
      }
    },
    [numTxs, txPlanIndex, formValues, onStepSuccess, onPlanSuccess],
  );

  return { getTxPlan, getNextTx, txPlanIndex, numTxs, isPlanStarted, onTxSuccess };
}

export function useTransactionFlowConfirmation() {
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | undefined>(
    undefined,
  );
  const onConfirmed = useCallback((d: ConfirmationDetails) => setConfirmationDetails(d), []);
  return { confirmationDetails, onConfirmed };
}
