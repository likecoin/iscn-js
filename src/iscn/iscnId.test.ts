import { ISCNSignPayload } from '../types';
import { getMsgCreateISCNRecordJSON, getISCNIdPrefix } from './iscnId';

const sender = 'like1ukmjl5s6pnw2txkvz2hd2n0f6dulw34h9rw5zn';

const fingerprint = 'hash://sha256/9564b85669d5e96ac969dd0161b8475bbced9e5999c6ec598da718a3045d6f2e';

const stakeholder1 = {
  entity: {
    '@id': 'did:cosmos:5sy29r37gfxvxz21rh4r0ktpuc46pzjrmz29g45',
    name: 'Chung Wu',
  },
  rewardProportion: 95,
  contributionType: 'http://schema.org/author',
};

const stakeholder2 = {
  rewardProportion: 5,
  contributionType: 'http://schema.org/citation',
  footprint: 'https://en.wikipedia.org/wiki/Fibonacci_number',
  description: 'The blog post referred the matrix form of computing Fibonacci numbers.',
};

const contentMetadata = {
  '@context': 'http://schema.org/',
  '@type': 'CreativeWorks',
  title: '使用矩陣計算遞歸關係式',
  description: 'An article on computing recursive function with matrix multiplication.',
  datePublished: '2019-04-19',
  version: 1,
  url: 'https://nnkken.github.io/post/recursive-relation/',
  author: 'https://github.com/nnkken',
  usageInfo: 'https://creativecommons.org/licenses/by/4.0',
  keywords: 'matrix,recursion',
};

const iscnSignPayloadBasic = {
  recordNotes: 'some update',
  contentFingerprints: [fingerprint],
  stakeholders: [stakeholder1, stakeholder2],
  contentMetadata,
} as ISCNSignPayload;

const iscnSignPayloadEmpty = {
  recordNotes: '',
  contentFingerprints: [],
  stakeholders: [],
  contentMetadata: {},
} as ISCNSignPayload;

const toEscapeChars = ['\b', '\v', '\f', '&', '<', '>', '\u2028', '\u2029'];
const iscnPrefixes = [
  '_taL3_yyHGp-D9RaZ7SPR9-vIR_9vlnVow9b9DvhmX0',
  'Ua4NYnlcxYAjMIFoaxJEuYefRYKsBs27tKDA-r5PDuE',
  'LIOVEMF0QOa8jWHRPtC0gCIhpUYaQjcehgIsNIQVaNY',
  'qFpssVqtLyIGhbPeuiIWtz1eRIB36r-8l_Qe4fL_iJg',
  'JkgbEeipLlii8HPy6AktfKf6XJTgJaVdMeuRQXhxs_s',
  'YJHeT_exqazC9aCZlhVJsAGxhrw8gQJntJj7qgc3ZjM',
  '6l6vB9tVZtgi1VYKNwz45PSe4633wK2RtCwjHntf4-I',
  'q7LaD9-LOjc3YM30RFWKZLuNoS9ZgE7p3QyV9Qu3AGY',
];

const iscnSignPayloadToEscape = {
  recordNotes: '<>&\u2028\u2029\u2029\u2028&><',
  contentFingerprints: [],
  stakeholders: [],
  contentMetadata: {},
} as ISCNSignPayload;

let allASCIIChars = '';
for (let i = 0; i < 128; i += 1) {
  allASCIIChars += String.fromCharCode(i);
}

const iscnSignPayloadASCII = {
  recordNotes: allASCIIChars,
  contentFingerprints: [],
  stakeholders: [],
  contentMetadata: {},
} as ISCNSignPayload;

describe('getMsgCreateIscnRecordJSON', () => {
  test('Test basic message', async () => {
    const res = getMsgCreateISCNRecordJSON(
      sender,
      iscnSignPayloadBasic,
    );
    expect(res).toEqual('{"type":"likecoin-chain/MsgCreateIscnRecord","value":{"from":"like1ukmjl5s6pnw2txkvz2hd2n0f6dulw34h9rw5zn","record":{"contentFingerprints":["hash://sha256/9564b85669d5e96ac969dd0161b8475bbced9e5999c6ec598da718a3045d6f2e"],"contentMetadata":{"@context":"http://schema.org/","@type":"CreativeWorks","author":"https://github.com/nnkken","datePublished":"2019-04-19","description":"An article on computing recursive function with matrix multiplication.","keywords":"matrix,recursion","title":"使用矩陣計算遞歸關係式","url":"https://nnkken.github.io/post/recursive-relation/","usageInfo":"https://creativecommons.org/licenses/by/4.0","version":1},"recordNotes":"some update","stakeholders":[{"contributionType":"http://schema.org/author","entity":{"@id":"did:cosmos:5sy29r37gfxvxz21rh4r0ktpuc46pzjrmz29g45","name":"Chung Wu"},"rewardProportion":95},{"contributionType":"http://schema.org/citation","description":"The blog post referred the matrix form of computing Fibonacci numbers.","footprint":"https://en.wikipedia.org/wiki/Fibonacci_number","rewardProportion":5}]}}}');
  });

  test('Test message with nonce', async () => {
    const res = getMsgCreateISCNRecordJSON(
      sender,
      iscnSignPayloadBasic,
      1,
    );
    expect(res).toEqual('{"type":"likecoin-chain/MsgCreateIscnRecord","value":{"from":"like1ukmjl5s6pnw2txkvz2hd2n0f6dulw34h9rw5zn","nonce":"1","record":{"contentFingerprints":["hash://sha256/9564b85669d5e96ac969dd0161b8475bbced9e5999c6ec598da718a3045d6f2e"],"contentMetadata":{"@context":"http://schema.org/","@type":"CreativeWorks","author":"https://github.com/nnkken","datePublished":"2019-04-19","description":"An article on computing recursive function with matrix multiplication.","keywords":"matrix,recursion","title":"使用矩陣計算遞歸關係式","url":"https://nnkken.github.io/post/recursive-relation/","usageInfo":"https://creativecommons.org/licenses/by/4.0","version":1},"recordNotes":"some update","stakeholders":[{"contributionType":"http://schema.org/author","entity":{"@id":"did:cosmos:5sy29r37gfxvxz21rh4r0ktpuc46pzjrmz29g45","name":"Chung Wu"},"rewardProportion":95},{"contributionType":"http://schema.org/citation","description":"The blog post referred the matrix form of computing Fibonacci numbers.","footprint":"https://en.wikipedia.org/wiki/Fibonacci_number","rewardProportion":5}]}}}');
  });

  test('Test message with empty payload', async () => {
    const res = getMsgCreateISCNRecordJSON(
      sender,
      iscnSignPayloadEmpty,
    );
    expect(res).toEqual('{"type":"likecoin-chain/MsgCreateIscnRecord","value":{"from":"like1ukmjl5s6pnw2txkvz2hd2n0f6dulw34h9rw5zn","record":{"contentMetadata":{"@context":"http://schema.org/","keywords":"","version":1}}}}');
  });

  test('Test message with nonce and empty metadata', async () => {
    const res = getMsgCreateISCNRecordJSON(
      sender,
      iscnSignPayloadEmpty,
      1,
    );
    expect(res).toEqual('{"type":"likecoin-chain/MsgCreateIscnRecord","value":{"from":"like1ukmjl5s6pnw2txkvz2hd2n0f6dulw34h9rw5zn","nonce":"1","record":{"contentMetadata":{"@context":"http://schema.org/","keywords":"","version":1}}}}');
  });
});

describe('getISCNId', () => {
  test('Test basic message', async () => {
    const res = getISCNIdPrefix(
      sender,
      iscnSignPayloadBasic,
    );
    expect(res).toEqual('sVRejzXnUcqofAPXUZHXWSZn5wG8NZrDwmDk8nsqL60');
  });

  test('Test basic message with nonce', async () => {
    const res = getISCNIdPrefix(
      sender,
      iscnSignPayloadBasic,
      1,
    );
    expect(res).toEqual('apbYZM8j6g3i3G-Cd9EaO8fm9TejhVNNM1_sinjYfXU');
  });

  test('Test message with empty payload', async () => {
    const res = getISCNIdPrefix(
      sender,
      iscnSignPayloadEmpty,
    );
    expect(res).toEqual('RDdHkXNUy-iAXkY2lZQMwjRxAihs_jymeI3Mrw7cLuI');
  });

  test('Test message with nonce and empty payload', async () => {
    const res = getISCNIdPrefix(
      sender,
      iscnSignPayloadEmpty,
      1,
    );
    expect(res).toEqual('9BTHkP5NiO_Zo2L5rnXy7H4bGocv3qZp7UH82kYVvjY');
  });

  for (let i = 0; i < toEscapeChars.length; i += 1) {
    const char = toEscapeChars[i];
    // eslint-disable-next-line no-loop-func
    test(`Test message with char ${char}`, async () => {
      const iscnSignPayload = iscnSignPayloadEmpty;
      iscnSignPayload.recordNotes = char;
      const res = getISCNIdPrefix(
        sender,
        iscnSignPayload,
      );
      expect(res).toEqual(iscnPrefixes[i]);
    });
  }

  test('Test message with chars need to be escaped', async () => {
    const res = getISCNIdPrefix(
      sender,
      iscnSignPayloadToEscape,
    );
    expect(res).toEqual('42NjT3XiIHNOrZL54UJb0QDoZOyaVAPfB_9cmgrlqeM');
  });

  test('Test all ASCII chars', async () => {
    const res = getISCNIdPrefix(
      sender,
      iscnSignPayloadASCII,
    );
    expect(res).toEqual('ZWCb3fOKAPxxm68T-Tiv_Q78y8OwqvCg7ye_N0obLSw');
  });
});
