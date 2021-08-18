import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ContractAddresses } from 'src/app/shared/models/blockchain/NetMode';

export const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY
] as const;

export type SupportedBlockchain = typeof supportedBlockchains[number];

export const contractAddressesNetMode: ContractAddresses<SupportedBlockchain> = {
  mainnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    [BLOCKCHAIN_NAME.POLYGON]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    [BLOCKCHAIN_NAME.HARMONY]: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a'
  },
  testnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    [BLOCKCHAIN_NAME.POLYGON]: '0x13c038147aa2c91cf1fdb6f17a12f27715a4ca99',
    [BLOCKCHAIN_NAME.HARMONY]: '0xc0320368514b7961256d62bd7bc984623c0f7f65'
  }
};
