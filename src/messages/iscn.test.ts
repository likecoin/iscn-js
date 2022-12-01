import { formatISCNPayload } from './iscn';

describe('formatISCNPayload', () => {
  test('formatISCNPayload with fields', async () => {
    const res = formatISCNPayload({
      name: 'name',
      description: 'description',
      contentFingerprints: [],
      stakeholders: [],
    });
    const metadata = JSON.parse(res.contentMetadata.toString());
    expect(metadata).toEqual(
      expect.objectContaining({
        name: 'name',
        description: 'description',
      }),
    );
  });
  test('formatISCNPayload with array keywords', async () => {
    const res = formatISCNPayload({
      name: 'name',
      description: 'description',
      keywords: ['key', 'words'],
      contentFingerprints: [],
      stakeholders: [],
    });
    const metadata = JSON.parse(res.contentMetadata.toString());
    expect(metadata).toEqual(
      expect.objectContaining({
        name: 'name',
        description: 'description',
        keywords: 'key,words',
      }),
    );
  });

  test('formatISCNPayload with string keywords', async () => {
    const res = formatISCNPayload({
      name: 'name',
      description: 'description',
      keywords: 'key, words',
      contentFingerprints: [],
      stakeholders: [],
    });
    const metadata = JSON.parse(res.contentMetadata.toString());
    expect(metadata).toEqual(
      expect.objectContaining({
        name: 'name',
        description: 'description',
        keywords: 'key, words',
      }),
    );
  });

  test('formatISCNPayload with contentMetadata object', async () => {
    const res = formatISCNPayload({
      contentMetadata: {
        name: 'name',
        description: 'description',
        keywords: 'key, words',
      },
      contentFingerprints: [],
      stakeholders: [],
    });
    const metadata = JSON.parse(res.contentMetadata.toString());
    expect(metadata).toEqual(
      expect.objectContaining({
        name: 'name',
        description: 'description',
        keywords: 'key, words',
      }),
    );
  });
});
