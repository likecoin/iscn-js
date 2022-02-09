const { Router } = require('express');
const {
  getISCNSigningClient,
  getISCNQueryClient,
  getISCNSigningAddressInfo,
} = require('./iscn');

const router = Router();
router.post(
  '/new',
  async (req, res, next) => {
    try {
      let { metadata = {} } = req.body;
      const {
        contentFingerprints = [],
        stakeholders = [],
        type,
        name,
        descrption,
        usageInfo,
        keywords = [],
        datePublished,
        url,
      } = metadata;
      if (!type) {
        res.status(400).send('TYPE_SHOULD_BE_DEFINED');
        return;
      }
      if (!Array.isArray(contentFingerprints)) {
        res.status(400).send('FINGERPRINTS_SHOULD_BE_ARRAY');
        return;
      }
      if (!Array.isArray(stakeholders)) {
        res.status(400).send('STAKEHOLDERS_SHOULD_BE_ARRAY');
        return;
      }
      if (!Array.isArray(keywords)) {
        res.status(400).send('KEYWORDS_SHOULD_BE_ARRAY');
        return;
      }
      const [signingClient, queryClient] = await Promise.all([
        getISCNSigningClient(),
        getISCNQueryClient(),
      ]);
      const recordNotes = ''; // add iscn record remarks on chain
      const ISCNPayload = {
        contentFingerprints,
        stakeholders,
        type,
        name,
        descrption,
        usageInfo,
        keywords,
        recordNotes,
        datePublished,
        url,
      };
      const { address } = await getISCNSigningAddressInfo();
      const iscnRes = await signingClient.createISCNRecord(
        address,
        ISCNPayload,
      );
      const { transactionHash: iscnTxHash } = iscnRes;
      console.log(`txHash: ${iscnTxHash}`);
      const [iscnId] = await queryClient.queryISCNIdsByTx(iscnTxHash);
      console.log(`ISCN ID: ${iscnId}`);

      res.json({
        txHash: iscnTxHash,
        iscnId,
      });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
