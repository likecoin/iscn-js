# Changelog
## [Unreleased]

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
