import CscSvg from '~/core/csc';
import { getLocale } from '~/core/locale';

export const chainConfig= {
  52: {
    name: "CoinEx Smart Chain",
    explorer: "https://www.coinex.net",
    address: "https://www.coinex.net/address/[addr]",
    tx: "https://www.coinex.net/tx/[addr]",
    logo: CscSvg,
    logoUrl: 'https://www.coinex.net/images/index/coinex.png',
    rpcUrl: "https://rpc.coinex.net",
    contractAddress: "0x2bf314052073D9347a0FbeBCD2A4622FA26a967B",
    title() {
      return getLocale('coinExChainMain')
    },
    nativeCurrency: {
      name: 'CoinEx',
      symbol: 'CET',
      decimals: 18,
    },
  },
  53: {
    name: "CoinEx Smart Chain(Test)",
    explorer: "https://testnet.coinex.net",
    address: "https://testnet.coinex.net/address/[addr]",
    tx: "https://testnet.coinex.net/tx/[addr]",
    logo: CscSvg,
    logoUrl: 'https://www.coinex.net/images/index/coinex.png',
    rpcUrl: "https://testnet-rpc.coinex.net",
    contractAddress: "0x9CeAE1F68f08A9C7367E3278Ab8d0B7fBa57c62B",
    title() {
      return getLocale('coinExChainTest')
    },
    network() {
      return getLocale('testnet')
    },
    nativeCurrency: {
      name: 'CoinEx',
      symbol: 'CET',
      decimals: 18,
    },
  },
};

export function getChain(chainId) {
  return chainConfig[chainId] || {};
}

export function getLogo(chainId) {
  return chainConfig[chainId] && chainConfig[chainId].logo;
}

export function getAddress(chainId, type , address) {
  return chainConfig[chainId][type].replace("[addr]", address);
}