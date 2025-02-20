import { useCallback, useEffect } from 'react';
import { Modal, useModal } from 'src/components/menus/Modal';
import { AccountConnectForm } from 'src/features/account/AccountConnectForm';
import { LockFlow } from 'src/features/locking/LockFlow';
import { StakeFlow } from 'src/features/staking/StakeFlow';
import { useStore } from 'src/features/store';
import { TxModalType } from 'src/features/transactions/types';
import { useAccount } from 'wagmi';

const TypeToComponent: Record<TxModalType, React.FC<any>> = {
  [TxModalType.Lock]: LockFlow,
  [TxModalType.Stake]: StakeFlow,
  [TxModalType.Vote]: PlaceholderContent,
  [TxModalType.Delegate]: PlaceholderContent,
};

export function useTransactionModal(defaultType?: TxModalType, defaultProps?: any) {
  const setTxModal = useStore((state) => state.setTransactionModal);
  return useCallback(
    (_type?: TxModalType, _props?: any) => {
      const type = _type || defaultType;
      const props = _props || defaultProps;
      if (!type) return;
      setTxModal({ type, props });
    },
    [setTxModal, defaultType, defaultProps],
  );
}

export function TransactionModal() {
  const { isModalOpen, closeModal, openModal } = useModal();

  const activeModal = useStore((state) => state.activeModal);
  const { type, props } = activeModal;

  const { address, isConnected } = useAccount();
  const isReady = address && isConnected;

  const Component = !isReady
    ? AccountConnectForm
    : type
      ? TypeToComponent[type]
      : PlaceholderContent;

  useEffect(() => {
    if (!openModal || !activeModal?.type) return;
    openModal();
  }, [activeModal, openModal]);

  return (
    <Modal isOpen={isModalOpen} close={closeModal}>
      <div className="flex min-h-[24rem] min-w-[18rem] max-w-sm flex-col border border-taupe-300 p-2.5">
        <Component {...props} closeModal={closeModal} />
      </div>
    </Modal>
  );
}

function PlaceholderContent() {
  return <div className="flex items-center justify-center px-4 py-6">...</div>;
}
