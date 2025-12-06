## [0.12.0-devel.3](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.12.0-devel.2...v0.12.0-devel.3) (2025-12-06)

### Performance Improvements

* optimize build script to skip redundant builds ([#995](https://github.com/zextras/carbonio-admin-console-ui/issues/995)) ([e639bcb](https://github.com/zextras/carbonio-admin-console-ui/commit/e639bcba65da48cda979747062d7423686b7faba))

## [0.12.0-devel.2](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.12.0-devel.1...v0.12.0-devel.2) (2025-12-05)

### Bug Fixes

* simplify certificate modal props ([#993](https://github.com/zextras/carbonio-admin-console-ui/issues/993)) ([74a1699](https://github.com/zextras/carbonio-admin-console-ui/commit/74a169991c6a0c1111d51672cf5e7d36b9d89dcc))

## [0.12.0-devel.1](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.1-devel.5...v0.12.0-devel.1) (2025-12-05)

### Features

* **ci:** add renovate definition for dependencies management ([#988](https://github.com/zextras/carbonio-admin-console-ui/issues/988)) ([01823d4](https://github.com/zextras/carbonio-admin-console-ui/commit/01823d45e90a3de036207e22c53f49e9672970f5))

### Performance Improvements

* **ci:** optimize stashing by including only required files ([#994](https://github.com/zextras/carbonio-admin-console-ui/issues/994)) ([38f2b0f](https://github.com/zextras/carbonio-admin-console-ui/commit/38f2b0fe291441e4312931805a8f0e9a0df37b23))

## [0.11.1-devel.5](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.1-devel.4...v0.11.1-devel.5) (2025-12-04)

### Bug Fixes

* **apps/admin-ui-bootstrap:** handle unsupported advanced in init ([#987](https://github.com/zextras/carbonio-admin-console-ui/issues/987)) ([36c7cc5](https://github.com/zextras/carbonio-admin-console-ui/commit/36c7cc595956cd134c5f1e071fe4477d80059bd9))

## [0.11.1-devel.4](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.1-devel.3...v0.11.1-devel.4) (2025-12-01)

### Bug Fixes

* mta inbound flow security are not persisting in ce ([#978](https://github.com/zextras/carbonio-admin-console-ui/issues/978)) ([485ba9f](https://github.com/zextras/carbonio-admin-console-ui/commit/485ba9f57705b836aa62549a90a827f28a5a88a5))

## [0.11.1-devel.3](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.1-devel.2...v0.11.1-devel.3) (2025-11-27)

### Bug Fixes

* fixed issue of send otp bugs in user security ([#970](https://github.com/zextras/carbonio-admin-console-ui/issues/970)) ([0f43855](https://github.com/zextras/carbonio-admin-console-ui/commit/0f43855e01a9ada69f7857faa6770922a168f7b8))

## [0.11.1-devel.2](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.1-devel.1...v0.11.1-devel.2) (2025-11-25)

### Bug Fixes

* fixed the issue of undefined ref in wizard ([a8e8296](https://github.com/zextras/carbonio-admin-console-ui/commit/a8e8296adcc2aafc7ceb75097eaa2e89910b4bb8))

## [0.11.1-devel.1](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.0...v0.11.1-devel.1) (2025-11-24)

### Bug Fixes

* **ci:** correct image name for admin console UI ([#971](https://github.com/zextras/carbonio-admin-console-ui/issues/971)) ([0dcecfa](https://github.com/zextras/carbonio-admin-console-ui/commit/0dcecfa0e0cce1948f2ec17f5af2ecc303cd9869))

## [0.11.0](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.10.9...v0.11.0) (2025-11-17)

### Features

* Implement subscription status banner refs: CO-2679 ([#911](https://github.com/zextras/carbonio-admin-console-ui/issues/911)) ([97859b0](https://github.com/zextras/carbonio-admin-console-ui/commit/97859b04f214fb728691a53b7ec96132816be7cc))

### Bug Fixes

* admin bootstrap watch mode fixed ([#908](https://github.com/zextras/carbonio-admin-console-ui/issues/908)) ([5383d50](https://github.com/zextras/carbonio-admin-console-ui/commit/5383d5013b70a0723a13bfdc7cdb38c6f66078e4))
* changed translation pointing repo ([8b919b8](https://github.com/zextras/carbonio-admin-console-ui/commit/8b919b8c28d7458c5c562e8926c12ceb85dc56dd))
* **ci:** avoid issues with packages upload ([877ca99](https://github.com/zextras/carbonio-admin-console-ui/commit/877ca99c4e3f6517fbd9d393d099c1dc4335eebf))
* CO-2515 rename ha to MailReplica ([#898](https://github.com/zextras/carbonio-admin-console-ui/issues/898)) ([8f36e29](https://github.com/zextras/carbonio-admin-console-ui/commit/8f36e29ee4354e944f81440354b025f388e2fcb3))
* cos name only allow in lowercase letters ([#959](https://github.com/zextras/carbonio-admin-console-ui/issues/959)) ([7c6ebac](https://github.com/zextras/carbonio-admin-console-ui/commit/7c6ebac461ff370bb52bb8a12d82f62006a54752))
* deploy script fix in sdk ([c9e7f70](https://github.com/zextras/carbonio-admin-console-ui/commit/c9e7f70402a1f0dd599b94252173a55e2c0dfee4))
* fix admin bootstrap translation configration from weblate ([c4ea3f8](https://github.com/zextras/carbonio-admin-console-ui/commit/c4ea3f88e0658d4f5c9bc019054fba625d2bb7ff))
* fix missing translation ([#909](https://github.com/zextras/carbonio-admin-console-ui/issues/909)) ([1d60c9f](https://github.com/zextras/carbonio-admin-console-ui/commit/1d60c9f740d7ca09766764ddf3238458ade4d15a))
* fix test case ([277a986](https://github.com/zextras/carbonio-admin-console-ui/commit/277a986387c39fecacb093bea37353dfb832049f))
* fixed as per webui18n updated translation directory path for dep… ([#941](https://github.com/zextras/carbonio-admin-console-ui/issues/941)) ([b9a4764](https://github.com/zextras/carbonio-admin-console-ui/commit/b9a47644a152b448577fb8f10e1ee242c053b1c6))
* fixed cropped button on delete cos modal refs: CO-2757 ([#942](https://github.com/zextras/carbonio-admin-console-ui/issues/942)) ([e18c232](https://github.com/zextras/carbonio-admin-console-ui/commit/e18c2328de413525deba54af26ad2478be36eee4))
* prevented accidental closure of settings when clicking outside of them refs: CO-2311 ([#897](https://github.com/zextras/carbonio-admin-console-ui/issues/897)) ([4f8cf79](https://github.com/zextras/carbonio-admin-console-ui/commit/4f8cf797e61b1d1ee5aef04c3621dc26eece6f09))
* Read Receipt settings and Permit the user to ask for read receip… ([#963](https://github.com/zextras/carbonio-admin-console-ui/issues/963)) ([bc58a9d](https://github.com/zextras/carbonio-admin-console-ui/commit/bc58a9d254ccc887b362fd8b20f3ab520b7c74c7))
* removed pattern from webpack ([#930](https://github.com/zextras/carbonio-admin-console-ui/issues/930)) ([3d48c53](https://github.com/zextras/carbonio-admin-console-ui/commit/3d48c53f513be4bbaaae61d8ad6e9292c0e9a305))
* **root)(Jenkinsfile:** add credentials for npm and github in release step ([#962](https://github.com/zextras/carbonio-admin-console-ui/issues/962)) ([8845438](https://github.com/zextras/carbonio-admin-console-ui/commit/8845438fa2398c89f33db384a355e28ebd723e5f))
* **root:** update pkgbuild conflicts and provides (build_unified) ([#964](https://github.com/zextras/carbonio-admin-console-ui/issues/964)) ([e72b5c4](https://github.com/zextras/carbonio-admin-console-ui/commit/e72b5c43e22abdb22593cfe6f3633fb44450d736))
* sonarqube fix refs: C=2523 ([19ded58](https://github.com/zextras/carbonio-admin-console-ui/commit/19ded585240e523461f1ba314a179a39388f4a8b))
* update app and repo names ([#957](https://github.com/zextras/carbonio-admin-console-ui/issues/957)) ([2500fe1](https://github.com/zextras/carbonio-admin-console-ui/commit/2500fe1d846994f70975309d2b64374f68fc27db))

## [0.11.0-devel.4](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.0-devel.3...v0.11.0-devel.4) (2025-11-17)

### Bug Fixes

* **ci:** avoid issues with packages upload ([877ca99](https://github.com/zextras/carbonio-admin-console-ui/commit/877ca99c4e3f6517fbd9d393d099c1dc4335eebf))

## [0.11.0-devel.3](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.0-devel.2...v0.11.0-devel.3) (2025-11-17)

### Bug Fixes

* Read Receipt settings and Permit the user to ask for read receip… ([#963](https://github.com/zextras/carbonio-admin-console-ui/issues/963)) ([bc58a9d](https://github.com/zextras/carbonio-admin-console-ui/commit/bc58a9d254ccc887b362fd8b20f3ab520b7c74c7))
* **root:** update pkgbuild conflicts and provides (build_unified) ([#964](https://github.com/zextras/carbonio-admin-console-ui/issues/964)) ([e72b5c4](https://github.com/zextras/carbonio-admin-console-ui/commit/e72b5c43e22abdb22593cfe6f3633fb44450d736))

## [0.11.0-devel.2](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.11.0-devel.1...v0.11.0-devel.2) (2025-11-14)

### Bug Fixes

* **root)(Jenkinsfile:** add credentials for npm and github in release step ([#962](https://github.com/zextras/carbonio-admin-console-ui/issues/962)) ([8845438](https://github.com/zextras/carbonio-admin-console-ui/commit/8845438fa2398c89f33db384a355e28ebd723e5f))

## [0.11.0-devel.1](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.10.9...v0.11.0-devel.1) (2025-11-13)

### Features

* Implement subscription status banner refs: CO-2679 ([#911](https://github.com/zextras/carbonio-admin-console-ui/issues/911)) ([97859b0](https://github.com/zextras/carbonio-admin-console-ui/commit/97859b04f214fb728691a53b7ec96132816be7cc))

### Bug Fixes

* admin bootstrap watch mode fixed ([#908](https://github.com/zextras/carbonio-admin-console-ui/issues/908)) ([5383d50](https://github.com/zextras/carbonio-admin-console-ui/commit/5383d5013b70a0723a13bfdc7cdb38c6f66078e4))
* changed translation pointing repo ([8b919b8](https://github.com/zextras/carbonio-admin-console-ui/commit/8b919b8c28d7458c5c562e8926c12ceb85dc56dd))
* CO-2515 rename ha to MailReplica ([#898](https://github.com/zextras/carbonio-admin-console-ui/issues/898)) ([8f36e29](https://github.com/zextras/carbonio-admin-console-ui/commit/8f36e29ee4354e944f81440354b025f388e2fcb3))
* cos name only allow in lowercase letters ([#959](https://github.com/zextras/carbonio-admin-console-ui/issues/959)) ([7c6ebac](https://github.com/zextras/carbonio-admin-console-ui/commit/7c6ebac461ff370bb52bb8a12d82f62006a54752))
* deploy script fix in sdk ([c9e7f70](https://github.com/zextras/carbonio-admin-console-ui/commit/c9e7f70402a1f0dd599b94252173a55e2c0dfee4))
* fix admin bootstrap translation configration from weblate ([c4ea3f8](https://github.com/zextras/carbonio-admin-console-ui/commit/c4ea3f88e0658d4f5c9bc019054fba625d2bb7ff))
* fix missing translation ([#909](https://github.com/zextras/carbonio-admin-console-ui/issues/909)) ([1d60c9f](https://github.com/zextras/carbonio-admin-console-ui/commit/1d60c9f740d7ca09766764ddf3238458ade4d15a))
* fix test case ([277a986](https://github.com/zextras/carbonio-admin-console-ui/commit/277a986387c39fecacb093bea37353dfb832049f))
* fixed as per webui18n updated translation directory path for dep… ([#941](https://github.com/zextras/carbonio-admin-console-ui/issues/941)) ([b9a4764](https://github.com/zextras/carbonio-admin-console-ui/commit/b9a47644a152b448577fb8f10e1ee242c053b1c6))
* fixed cropped button on delete cos modal refs: CO-2757 ([#942](https://github.com/zextras/carbonio-admin-console-ui/issues/942)) ([e18c232](https://github.com/zextras/carbonio-admin-console-ui/commit/e18c2328de413525deba54af26ad2478be36eee4))
* prevented accidental closure of settings when clicking outside of them refs: CO-2311 ([#897](https://github.com/zextras/carbonio-admin-console-ui/issues/897)) ([4f8cf79](https://github.com/zextras/carbonio-admin-console-ui/commit/4f8cf797e61b1d1ee5aef04c3621dc26eece6f09))
* removed pattern from webpack ([#930](https://github.com/zextras/carbonio-admin-console-ui/issues/930)) ([3d48c53](https://github.com/zextras/carbonio-admin-console-ui/commit/3d48c53f513be4bbaaae61d8ad6e9292c0e9a305))
* sonarqube fix refs: C=2523 ([19ded58](https://github.com/zextras/carbonio-admin-console-ui/commit/19ded585240e523461f1ba314a179a39388f4a8b))
* update app and repo names ([#957](https://github.com/zextras/carbonio-admin-console-ui/issues/957)) ([2500fe1](https://github.com/zextras/carbonio-admin-console-ui/commit/2500fe1d846994f70975309d2b64374f68fc27db))
