import Image from 'next/image';
import { Circle } from 'src/components/icons/Circle';
import { Identicon } from 'src/components/icons/Identicon';
import { ZERO_ADDRESS } from 'src/config/consts';
import { VALIDATOR_GROUPS } from 'src/config/validators';
import { shortenAddress } from 'src/utils/addresses';

export function ValidatorGroupLogo({ address, size }: { address: Address; size: number }) {
  return (
    <>
      {VALIDATOR_GROUPS[address] ? (
        <Image
          src={VALIDATOR_GROUPS[address].logo}
          height={size}
          width={size}
          alt=""
          className="rounded-full border border-taupe-300"
        />
      ) : !address || address === ZERO_ADDRESS ? (
        <Circle size={size} className="bg-yellow-500" />
      ) : (
        <Identicon address={address} size={size} />
      )}
    </>
  );
}

export function ValidatorGroupLogoAndName({
  address,
  name,
  size = 30,
  className,
}: {
  address: Address;
  name?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center ${className}`}>
      <ValidatorGroupLogo address={address} size={size} />
      <div className="ml-2 flex flex-col">
        <span>{name || 'Unknown'}</span>
        <span className="font-mono text-xs text-taupe-600">{shortenAddress(address)}</span>
      </div>
    </div>
  );
}
