# Changelog
## [Unreleased]
- Upgrade cosmjs-types to v0.8.0

## [0.6.0] - 2023-06-06
### Changed
- Upgrade to Cosmos SDK v0.46 and CosmJS v0.30.1
- Upgrade Node.js requirement to >=16
- Upgrade @likecoin/iscn-message-types to 0.0.7

### Added
- Add calculating ISCN ID prefix by metadata
- Add nonce support in ISCN payload

## [0.5.4] - 2023-06-01
### Added
- Add offline calculate NFT Class ID functions

## [0.5.3] - 2023-05-02
### Changed
- `estimateMsgTxGas()` would now return gas amount not lower than `DEFAULT_MESSAGE_GAS(200000)`;
### Fixed
- Fix class config was not set as optional param in `esimateNFTClassTxGasAndFee()`

## [0.5.2] - 2022-12-15
### Changed
- Update @likecoin/iscn-message-types to 0.0.5
### Fixed
- Fix invalid module path in package.json

## [0.5.1] - 2022-12-14
### Added
- Add royalty config in query client
- Add NFT marketplace related messages and query
### Changed
- Support array and string type for ISCN keywords
- Support using `contentMetadata` object directly when creating or updating ISCN

## [0.5.0] - 2022-11-24
### Added
- Add royalty config functions
### Changed
- Breaking: `calculateStakeholderRewards()` would not set a Map value if `amount` is not larger than 0
- Breaking: `calculateStakeholderRewards()` amount set into `defaultWallet` now also respect `precision`
- `parseStakeholderAddresses()` now accept `precision` as optional parameter.


## [0.4.2] - 2022-11-18
### Fixed
- Fix missing authz type definition in query client

## [0.4.1] - 2022-10-11
### Fixed
- Fix error caused by undefined @id

### Changed
- Breaking: getLikeWalletFromId return string instead of object, simplify interface


## [0.4.0] - 2022-10-10
### Changed
- Breaking: Renamed getStakeholderMapFromParsedIscnData, addressParsingFromIscnData, getStakeholderMapFromIscnData to calculateStakeholderRewards, parseStakeholderAddresses, parseAndCalculateStakeholderRewards
- Breaking: Rename LIKE to amount in calculateStakeholderRewards params and output
- Breaking: Output amount as string instead of number in the result of calculateStakeholderRewards

## [0.3.0] - 2022-10-05
### Added
- Add ISCN stakeholder ratio parsing function
- Add ISCN @id to like wallet parsing function

## [0.2.3] - 2022-08-30
### Changed
- Breaking: `estimateISCNTxFee` and `estimateISCNTxGas` are not exposed as indivdual functions in `signingClient` anymore, please use `esimateISCNTxGasAndFee`

### Added
- Add NFT fee and gas query and esimation functions

## [0.2.2] - 2022-08-15
### Changed
- Refactor gas estimation for NFT mint, class and multiple message send.

## [0.2.1] - 2022-07-29
### Changed
- Do not fill ISCN metadata into NFT Class metadata if not specified

## [0.2.0] - 2022-07-22
### Added
- Formal release for x/nft and x/likenft suppoer in likecoin chain v3.0.0

### Fixed
- Fix x/likenft event name changes in likecoin chain v3.0.0

## [0.2.0-rc.1] - 2022-07-06
### Added
- Update syntax and test according to likecoin chain 3.0.0-rc1

## [0.2.0-alpha.1] - 2022-06-14
### Added
- Add query classId by tx hash
- Add wrapped x/nft query functions
- Add testcases

### Fixed
- Use proper cosmjs-types version for peer dependency

## [0.2.0-alpha.0] - 2022-06-02
### Added
- Add x/likenft NFT Class creation and minting based on ISCN
- Add x/nft send NFT Token
- Add x/authz spend limit grant, execute and revoke
- Add query and transaction message parsing of x/nft, x/likenft and x/authz
- Improved transaction message parsing to support all message types included in this library
- Refactor message creation functions, which can now be used indivdually
- Add `sendMessages()` which can send a combinations of messages

### Changed
- Lower default gas price to 10
- Refactor code structure
- Update @cosmjs/stargate 0.28.4
- Update @likecoin/iscn-message-types

## [0.1.0] - 2022-03-08
### Changed
- Update breaking change from @cosmjs/stargate 0.27.1

## [0.0.7] - 2021-10-05
### Changed
- Improve accuracy of ISCN fee and gas estimation for large payload

## [0.0.6] - 2021-10-05
### Fixed
- Proper release of 0.0.5

## [0.0.5] - 2021-10-05
### Changed
- Allow broadcast = true and signing params to be defined at the same time
- Allow arbitrary keys in payload to be formatted into contentMetadata
### Fixed
- Fix signing params was not optional in signing client

## [0.0.4] - 2021-09-23
### Added
- Support defining custom gas price when signing
- Added more test case for signer

### Fixed
- Fixed create record transactoin did not support custom fee
- Fixed precision error when estimating gas amount

## [0.0.3] - 2021-09-19
### Added
- Support denom other than `nanolike` for use in testnet
- Added getter for internal stargate clients
- Support defining explicit signing params and fee in signer

### Fixed
- Fixed gas estimation for large payload by using multiple instead of addition for buffer

### Removed
- Removed more test files from dist

## [0.0.2] - 2021-09-11
### Changed
- Refactored signer connect function to allow setting rpc and signer seperately
- Changed some type definition for more flexiblity

### Removed
- Removed test files from dist

## [0.0.1] - 2021-09-07
### Added
- Initial release that support basic query and ISCN transaction sign & broadcast
