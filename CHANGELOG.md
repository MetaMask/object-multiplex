# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1]
- Export typescript types
## [1.2.0]
### Changed
- Throw error if parent is destroyed or ended already when creating sub streams ([#17](https://github.com/MetaMask/object-multiplex/pull/17), [#22](https://github.com/MetaMask/object-multiplex/pull/22))
  - Such streams would have failed after the first write anyway. This failure case should be easier to deal with now that we're identifying it earlier, with a more helpful error message.

## [1.1.0] - 2020-12-07
### Added
- TypeScript typings ([#9](https://github.com/MetaMask/object-multiplex/pull/9))

### Changed
- Rename package to @metamask/object-multiplex ([#12](https://github.com/MetaMask/object-multiplex/pull/12))

[Unreleased]: https://github.com/MetaMask/object-multiplex/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/MetaMask/object-multiplex/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/MetaMask/object-multiplex/releases/tag/v1.1.0
