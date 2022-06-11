import { IndexedTx } from '@cosmjs/stargate';
import { parseTxInfoFromIndexedTx } from './parsing';
import createISCN from '../tests/txs/createISCN.json';
import newNFTClass from '../tests/txs/newNFTClass.json';
import mintNFTs from '../tests/txs/mintNFTs.json';
import grantSpendLimit from '../tests/txs/grantSpendLimit.json';

function convertTxToUint8(t: any): IndexedTx {
  // eslint-disable-next-line no-param-reassign
  t.tx = Object.values(t.tx);
  return t as IndexedTx;
}

function expectTxBody(res: any, expected: any) {
  expect(res).toEqual(
    expect.objectContaining({
      tx: expect.objectContaining({
        body: expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining(expected),
          ]),
        }),
      }),
    }),
  );
}

describe('parseTxInfoFromIndexedTx', () => {
  test('parseISCNTx', async () => {
    const res = parseTxInfoFromIndexedTx(convertTxToUint8(createISCN));
    expectTxBody(res, {
      typeUrl: '/likechain.iscn.MsgCreateIscnRecord',
      value: expect.objectContaining({
        record: expect.objectContaining({
          contentFingerprints: expect.arrayContaining([
            'hash://sha256/9564b85669d5e96ac969dd0161b8475bbced9e5999c6ec598da718a3045d6f2e',
          ]),
          contentMetadata: expect.objectContaining({
            name: '使用矩陣計算遞歸關係式',
          }),
          stakeholders: expect.arrayContaining([
            expect.objectContaining({
              entity: expect.objectContaining({
                name: 'Chung Wu',
              }),
            }),
          ]),
        }),
      }),
    });
  });

  test('parseNewNFTClassTx', async () => {
    const res = parseTxInfoFromIndexedTx(convertTxToUint8(newNFTClass));
    expectTxBody(res, {
      typeUrl: '/likechain.likenft.MsgNewClass',
      value: expect.objectContaining({
        creator: 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp',
        parent: expect.objectContaining({
          iscnIdPrefix: 'iscn://likecoin-chain/obr5VPRtkMSaDzaQyg1izE0_dqC7yzwNGm8kUrsbHJg',
        }),
        input: expect.objectContaining({
          name: 'Liker NFT #1',
        }),
      }),
    });
  });

  test('parseMintNFTTx', async () => {
    const res = parseTxInfoFromIndexedTx(convertTxToUint8(mintNFTs));
    expect(res.tx.body.messages).toHaveLength(100);
    expectTxBody(res, {
      typeUrl: '/likechain.likenft.MsgMintNFT',
      value: expect.objectContaining({
        creator: 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp',
        classId: 'likenft17e6d3zd6td4jygpywe673a4deep2898vuktc37wm5j2vrk4cd3esdzeup0',
        id: 'testing-123123423-0',
      }),
    });
  });

  test('parseAuthz Tx', async () => {
    const res = parseTxInfoFromIndexedTx(convertTxToUint8(grantSpendLimit));
    expectTxBody(res, {
      typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
      value: expect.objectContaining({
        grant: expect.objectContaining({
          authorization: expect.objectContaining({
            typeUrl: '/cosmos.bank.v1beta1.SendAuthorization',
            value: expect.objectContaining({
              spendLimit: expect.arrayContaining([
                expect.objectContaining({
                  denom: 'nanolike',
                  amount: '100000000000',
                }),
              ]),
            }),
          }),
        }),
        grantee: 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp',
        granter: 'like1jnns8ttx8nhxleatsgwnrcandgw7a8sx24nc78',
      }),
    });
  });
});
