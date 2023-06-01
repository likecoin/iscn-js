import { calculateNFTClassIdByISCNId } from './nftId';

describe('calculateNFTClassIdByISCNId', () => {
  test('calculate NFT Class Id By ISCN Prefix 1', () => {
    const res = calculateNFTClassIdByISCNId('iscn://likecoin-chain/4UC3ZhKokFv3_rxP1p8QtCuDfHAcxcDZhbe4-rPMBGI');
    expect(res).toEqual('likenft19symzw3xmh42gukzts858wf6rsdkn6e4jtc9wp8jh4kphfmffy5s6acyxg');
  });
  test('calculate NFT Class Id By ISCN Id 1 v1', () => {
    const res = calculateNFTClassIdByISCNId('iscn://likecoin-chain/4UC3ZhKokFv3_rxP1p8QtCuDfHAcxcDZhbe4-rPMBGI/1');
    expect(res).toEqual('likenft19symzw3xmh42gukzts858wf6rsdkn6e4jtc9wp8jh4kphfmffy5s6acyxg');
  });
  test('calculate NFT Class Id By ISCN Id 1 v2', () => {
    const res = calculateNFTClassIdByISCNId('iscn://likecoin-chain/4UC3ZhKokFv3_rxP1p8QtCuDfHAcxcDZhbe4-rPMBGI/2');
    expect(res).toEqual('likenft19symzw3xmh42gukzts858wf6rsdkn6e4jtc9wp8jh4kphfmffy5s6acyxg');
  });

  test('calculate NFT Class Id By ISCN Id 2, count 0', () => {
    const res = calculateNFTClassIdByISCNId('iscn://likecoin-chain/-RE9tgVt3kacjRj-5XmCAuw6udrnmB1Q3ZkYikhaZXw', 0);
    expect(res).toEqual('likenft1pa94c6wgc6z8f5nc0lyt4cngyjzhskpn79pgy53mg7mxsn4p7efqcfglj9');
  });

  test('calculate NFT Class Id By ISCN Id 2, count 1', () => {
    const res = calculateNFTClassIdByISCNId('iscn://likecoin-chain/-RE9tgVt3kacjRj-5XmCAuw6udrnmB1Q3ZkYikhaZXw/2', 1);
    expect(res).toEqual('likenft1c782tw76am4n5jdckc98mxucdn240ezmtg8lltus23kg58cu0qws40w5hg');
  });
});
