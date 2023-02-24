import { ISCNRecordData } from '../types';
import { getMsgCreateIscnRecordJSON, getISCNIdPrefix } from './iscnId';

const dummyMsgCreateIscnRecord :{
  sender: string;
  iscnRecord: ISCNRecordData;
} = {
  sender: 'like1ukmjl5s6pnw2txkvz2hd2n0f6dulw34h9rw5zn',
  iscnRecord: {
    recordNotes: '',
    stakeholders: [],
    contentFingerprints: [],
    contentMetadata: {},
  },
};

describe('getMsgCreateIscnRecordJSON', () => {
  test('Test basic message', async () => {
    const res = getMsgCreateIscnRecordJSON(
      dummyMsgCreateIscnRecord.sender,
      dummyMsgCreateIscnRecord.iscnRecord,
    );
    expect(res).toEqual('{"type":"likecoin-chain/MsgCreateIscnRecord","value":{"from":"like1ukmjl5s6pnw2txkvz2hd2n0f6dulw34h9rw5zn","record":{"contentMetadata":{}}}}');
  });

  test('Test message with nonce', async () => {
    const res = getMsgCreateIscnRecordJSON(
      dummyMsgCreateIscnRecord.sender,
      dummyMsgCreateIscnRecord.iscnRecord,
      1,
    );
    expect(res).toEqual('{"type":"likecoin-chain/MsgCreateIscnRecord","value":{"from":"like1ukmjl5s6pnw2txkvz2hd2n0f6dulw34h9rw5zn","nonce":"1","record":{"contentMetadata":{}}}}');
  });
});

describe('getISCNId', () => {
  test('Test basic message', async () => {
    const res = getISCNIdPrefix(
      dummyMsgCreateIscnRecord.sender,
      dummyMsgCreateIscnRecord.iscnRecord,
    );
    expect(res).toEqual('rv5ahVKmxSu93jZlO6-X0oHP5NoIk0uQJj0zg84qKqs');
  });

  test('Test basic message with nonce', async () => {
    const res = getISCNIdPrefix(
      dummyMsgCreateIscnRecord.sender,
      dummyMsgCreateIscnRecord.iscnRecord,
      1,
    );
    expect(res).toEqual('5e1QGL5xM8GUFNU87poFMOQHcMATyqvPiGKIUQduuKw');
  });
});
