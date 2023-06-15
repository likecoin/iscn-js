import { AminoTypes, createDefaultAminoConverters } from '@cosmjs/stargate';
import { LikeNftAminoTypes } from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/amino';
import { IscnAminoTypes } from '@likecoin/iscn-message-types/dist/likechain/iscn/amino';

export const aminoTypes = new AminoTypes({
  ...createDefaultAminoConverters(),
  ...LikeNftAminoTypes,
  ...IscnAminoTypes,
});

export default aminoTypes;
