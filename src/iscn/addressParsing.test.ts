import { isValidAddress, changeAddressPrefix, getLikeWalletAddress } from './addressParsing';

describe('addressParsing', () => {
  test('isValidAddress invalid', async () => {
    const res = isValidAddress('errorInput');
    expect(res).toEqual(false);
  });

  test('isValidAddress valid like prefix', async () => {
    const res = isValidAddress('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
    expect(res).toEqual(true);
  });

  test('isValidAddress valid cosmos prefix', async () => {
    const res = isValidAddress('cosmos1tej2qstg4q255s620ld74gyvw0nzhklu5p9qq0');
    expect(res).toEqual(true);
  });

  test('changeAddressPrefix errorInput', async () => {
    try {
      changeAddressPrefix('errorInput', 'like');
    } catch (error) {
      expect(`${error}`).toEqual('Error: Mixed-case string errorInput');
    }
  });

  test('changeAddressPrefix cosmos to like', async () => {
    const res = changeAddressPrefix('cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz', 'like');
    expect(res).toEqual('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
  });

  test('changeAddressPrefix cosmos keep cosmos', async () => {
    const res = changeAddressPrefix('cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz', 'cosmos');
    expect(res).toEqual('cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz');
  });

  test('changeAddressPrefix like to cosmos', async () => {
    const res = changeAddressPrefix('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', 'cosmos');
    expect(res).toEqual('cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz');
  });

  test('changeAddressPrefix like keep like', async () => {
    const res = changeAddressPrefix('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', 'like');
    expect(res).toEqual('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
  });

  test('getLikeWalletAddress error input', async () => {
    const res = getLikeWalletAddress('errorInput');
    expect(res).toEqual(null);
  });

  test('getLikeWalletAddress no input', async () => {
    const res = getLikeWalletAddress('');
    expect(res).toEqual(null);
  });

  test('getLikeWalletAddress did:cosmos 1 input', async () => {
    const res = getLikeWalletAddress('did:cosmos:156gedr03g3ggwktzhygfusax4df46k8dyxjdcz');
    expect(res).toEqual('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
  });

  test('getLikeWalletAddress did:cosmos input', async () => {
    const res = getLikeWalletAddress('did:cosmos:56gedr03g3ggwktzhygfusax4df46k8dyxjdcz');
    expect(res).toEqual('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
  });

  test('getLikeWalletAddress did:like 1 input', async () => {
    const res = getLikeWalletAddress('did:like:1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5');
    expect(res).toEqual('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5');
  });

  test('getLikeWalletAddress did:like input', async () => {
    const res = getLikeWalletAddress('did:like:tej2qstg4q255s620ld74gyvw0nzhklu8aezr5');
    expect(res).toEqual('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5');
  });

  test('getLikeWalletAddress cosmos input', async () => {
    const res = getLikeWalletAddress('cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz');
    expect(res).toEqual('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
  });

  test('getLikeWalletAddress like input', async () => {
    const res = getLikeWalletAddress('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5');
    expect(res).toEqual('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5');
  });
});
