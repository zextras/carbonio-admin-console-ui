# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.10.3](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.10.2...v0.10.3) (2025-02-27)


### Bug Fixes

* use carbonioFeatureWscEnabled as attribute to activate wsc ([5502f71](https://github.com/zextras/carbonio-admin-console-ui/commit/5502f7181eb76ee310757596698574d9f80489e8))
* use carbonioFeatureWscEnabled as attribute to activate wsc ([1d15f00](https://github.com/zextras/carbonio-admin-console-ui/commit/1d15f009c2deefa52fd772544f0b8225b929f72f))

### [0.10.2](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.10.1...v0.10.2) (2025-02-24)


### Bug Fixes

* reduce posthog admin load from autocapture ([#818](https://github.com/zextras/carbonio-admin-console-ui/issues/818)) ([04309ba](https://github.com/zextras/carbonio-admin-console-ui/commit/04309baf72f5ae1f90e2b12559cec445efa8c90e))

### [0.10.1](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.10.0...v0.10.1) (2025-02-11)


### Bug Fixes

* enable polling interval for new email ([6e8d002](https://github.com/zextras/carbonio-admin-console-ui/commit/6e8d00298358ce3d4f52e80325056fdf99635dbc))

## [0.10.0](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.55...v0.10.0) (2025-02-10)


### ⚠ BREAKING CHANGES

* remove deprecated attributes from cosAdvanced

### Features

* added backupEnabled switch to cos advanced page ([4b7d881](https://github.com/zextras/carbonio-admin-console-ui/commit/4b7d881298715d2c80667b334c585f1430ead3a7))


### Bug Fixes

* [CO-1758] remove 'allow sending from any address' toggle ([#803](https://github.com/zextras/carbonio-admin-console-ui/issues/803)) ([4628f55](https://github.com/zextras/carbonio-admin-console-ui/commit/4628f5503d307dabaaba34053d70f9b32aa00665))
* account delegate search accout-group input fix ([#810](https://github.com/zextras/carbonio-admin-console-ui/issues/810)) ([0977d71](https://github.com/zextras/carbonio-admin-console-ui/commit/0977d71a5f7602a697ac70de8bc444d781f438da))
* cos failed login policy using proper translation key ([27c6a93](https://github.com/zextras/carbonio-admin-console-ui/commit/27c6a93aec67782ac92a483bf51d8da321e84a3a))
* extract COS email retention policy labels ([0a086c7](https://github.com/zextras/carbonio-admin-console-ui/commit/0a086c78e48ae6f9fb9f415b3f4b4ee7aeb30d5f))
* fix warning on COS general options ([a680532](https://github.com/zextras/carbonio-admin-console-ui/commit/a680532308564e802b11a94c71f88dc5a940c8db))
* include description when creating account from admin console ([#807](https://github.com/zextras/carbonio-admin-console-ui/issues/807)) ([82325c7](https://github.com/zextras/carbonio-admin-console-ui/commit/82325c7de387b90e782f7dee916128fd2752d46b))
* modify backup label in tests ([d428d1e](https://github.com/zextras/carbonio-admin-console-ui/commit/d428d1efde255514061134ec32b7d548032c7328))
* size diplayed in bytes instead of mb in mta advanced ([0cc7320](https://github.com/zextras/carbonio-admin-console-ui/commit/0cc732049fdeb011ae58f1be18e94c43024706ff))
* update Attribute type and inferring items in domain disclaimer ([3c81092](https://github.com/zextras/carbonio-admin-console-ui/commit/3c8109248cf93eb05c375ce435dee2821393dd52))
* update cosData, setCosData type with AccountType + create labels object ([b31ffd9](https://github.com/zextras/carbonio-admin-console-ui/commit/b31ffd99b195cb03fec30a6028d45816e9d64ca8))
* update getFileQuotaById response type in cos-advanced ([4e4be44](https://github.com/zextras/carbonio-admin-console-ui/commit/4e4be442d9aa7d0e989fdbf11c43b083f13e0832))
* use AccountType for COSAdvanced ([3e05d7c](https://github.com/zextras/carbonio-admin-console-ui/commit/3e05d7c78d1922f27483097df72595d610f611fe))
* use only modifyCosBody instead of JSON type ([fb7949e](https://github.com/zextras/carbonio-admin-console-ui/commit/fb7949ea409293fec2766c3c697a7b1771f90ed1))
* zimbraMailQuota type can be also number ([8a02935](https://github.com/zextras/carbonio-admin-console-ui/commit/8a02935677a6930d2259c669011afc4fbd3328d7))


* remove deprecated attributes from cosAdvanced ([9a75b67](https://github.com/zextras/carbonio-admin-console-ui/commit/9a75b67dfbcd7bd2e72b57363d2c4ab68cffc912))

### [0.9.55](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.54...v0.9.55) (2024-11-20)


### Bug Fixes

* used the password input instead of input for password fields ([bee6479](https://github.com/zextras/carbonio-admin-console-ui/commit/bee64798cfd2f30f058b22939a166a315527cfac))

### [0.9.54](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.53...v0.9.54) (2024-11-18)


### Features

* [C0-1422] Expose ability to  change zimbraFileUploadMaxSizePerFile in COS preferences ([#778](https://github.com/zextras/carbonio-admin-console-ui/issues/778)) ([21c9226](https://github.com/zextras/carbonio-admin-console-ui/commit/21c922634cd4351760c89423093724ff78ab5ae9)), closes [#779](https://github.com/zextras/carbonio-admin-console-ui/issues/779)
* [CO-1442] corner case handling for updating zimbraFileUploadMaxSizePerFile ([#781](https://github.com/zextras/carbonio-admin-console-ui/issues/781)) ([05b761a](https://github.com/zextras/carbonio-admin-console-ui/commit/05b761aa3f037406b09a7aa66cb45955451e69e6))
* [CO-1649] add Hungarian language in user and COS settings ([#791](https://github.com/zextras/carbonio-admin-console-ui/issues/791)) ([56d879b](https://github.com/zextras/carbonio-admin-console-ui/commit/56d879b214d2f983a8e87a7d5c11117abfdb3da4))
* specify domain for searchByFeature API ([#787](https://github.com/zextras/carbonio-admin-console-ui/issues/787)) ([3ddd60e](https://github.com/zextras/carbonio-admin-console-ui/commit/3ddd60e650b8fb5a64f7f9c8828b4d5b1354a69a))


### Bug Fixes

* [CO-1409] Correctly persist AuthLdapStartTlsEnabled & FeatureResetPasswordStatus attributes ([#788](https://github.com/zextras/carbonio-admin-console-ui/issues/788)) ([189b457](https://github.com/zextras/carbonio-admin-console-ui/commit/189b457cda5acbec761d7c7d4452f89874b2d838))
* bytes to gb calculation issue fixed ([98cc686](https://github.com/zextras/carbonio-admin-console-ui/commit/98cc6863425784268012069fcab5280789ec857b))
* fixed loading state of account detail view ([9b20b88](https://github.com/zextras/carbonio-admin-console-ui/commit/9b20b88432d0fff2fc57f4831fd20daa234a8a76))
* prefReadReceiptsToAddress removing and translations update ([86be666](https://github.com/zextras/carbonio-admin-console-ui/commit/86be666d78fcf9ed4af84a5d8d82115fd892f583))
* prefReadReceiptsToAddress removing and translations update ([b6fa384](https://github.com/zextras/carbonio-admin-console-ui/commit/b6fa384eb9390bb2520a8eb5a70c5cf2d4d94b48))
* set quota size to round of 2 decimal ([814dd1b](https://github.com/zextras/carbonio-admin-console-ui/commit/814dd1bda5960b6302b089ffb80a84f90a1218da))

### [0.9.53](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.52...v0.9.53) (2024-09-04)


### Bug Fixes

* subscription wsc module support added ([f8beb11](https://github.com/zextras/carbonio-admin-console-ui/commit/f8beb1164c43814cf14efdbfb164f2d59dc43e51))

### [0.9.52](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.51...v0.9.52) (2024-08-26)


### Features

* ac-1007: Restore an account including all deleted email for legal-hold related activities ([575f25a](https://github.com/zextras/carbonio-admin-console-ui/commit/575f25ac0aeeab69933112d39c440d79bb8e88f4))
* co-1346 enable otp management feature for account and cos ([169cece](https://github.com/zextras/carbonio-admin-console-ui/commit/169cecebc1eeb9ec8f380395974fedab1e4dcafd))
* manage wsc option from account and cos ([9a44c88](https://github.com/zextras/carbonio-admin-console-ui/commit/9a44c884980dfe733994336f025f112fd3621cca))


### Bug Fixes

* added server name in set-unset api and pagination issue fixed ([636a8f1](https://github.com/zextras/carbonio-admin-console-ui/commit/636a8f12449ea6e2e12eb1705de62b6d1c673f74))
* change work appendix to prefix ([28f312a](https://github.com/zextras/carbonio-admin-console-ui/commit/28f312aee90190827d7a6e36a730680158b6c305))
* change work appendix to prefix ([02de133](https://github.com/zextras/carbonio-admin-console-ui/commit/02de13382a883cecb418c4a00ec6b2bbb88ad53e))
* conflict resolved with devel ([abf9e89](https://github.com/zextras/carbonio-admin-console-ui/commit/abf9e89e78c20309d4e6543c07ff2275e33102c2))
* dropdown items click issue fixed ([df4811c](https://github.com/zextras/carbonio-admin-console-ui/commit/df4811c93d9702ad6d63a20ba4ca6817a40984e4))
* fixed sonarcube code smell ([d4337b0](https://github.com/zextras/carbonio-admin-console-ui/commit/d4337b066f1263ce3cbd3cfd9e4f183b670efe4b))
* fixed sonarcube code smell ([86876a2](https://github.com/zextras/carbonio-admin-console-ui/commit/86876a2baaa615ab5a1370b7da47df85c10acee0))
* fixed sonarcube code smell ([2849996](https://github.com/zextras/carbonio-admin-console-ui/commit/2849996fb23b644857048b75abb40f38ea75f17d))
* flush cache after modify cos ([7701138](https://github.com/zextras/carbonio-admin-console-ui/commit/7701138e25e67c060e781ca9d745f3b9f8b6d08e))
* sonarcube error fixed ([93253e2](https://github.com/zextras/carbonio-admin-console-ui/commit/93253e2b6ca2cd36e479c5c2f6b958f23cc3c8e9))

### [0.9.51](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.50...v0.9.51) (2024-07-02)


### Bug Fixes

* co-1251 backup and legal hold not visible in carbonio ce ([3fc8e1c](https://github.com/zextras/carbonio-admin-console-ui/commit/3fc8e1c2ce6e720eaac07ab44653f98a8c6d446e))
* legal hold error response message format ([56f5ec7](https://github.com/zextras/carbonio-admin-console-ui/commit/56f5ec7db1f55f3c9a2ddfc2129fb5fd26025e20))

### [0.9.50](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.49...v0.9.50) (2024-06-18)


### Features

* ac-1006: Leagal hold account status added ([8adc2c1](https://github.com/zextras/carbonio-admin-console-ui/commit/8adc2c1c5a984c189e2eb194920f8613678f9400))
* ac-1006: set and unset legal operation added ([0b5d660](https://github.com/zextras/carbonio-admin-console-ui/commit/0b5d660d40995c7dc8909d94f3907fa67b90deed))
* AC-1015 zimbraAuthMech selector label changes and info implemented ([f23b4eb](https://github.com/zextras/carbonio-admin-console-ui/commit/f23b4eb55885acac76fa042d2370822c592a8608))
* ac-1035 ac-1036 added indonesian language and removed chinese language ([#741](https://github.com/zextras/carbonio-admin-console-ui/issues/741)) ([2e1700d](https://github.com/zextras/carbonio-admin-console-ui/commit/2e1700d6ea1631ef00c38e1de8c55be0c18fe683))
* added documentation whitelabel url for admin panel ([2316f96](https://github.com/zextras/carbonio-admin-console-ui/commit/2316f96b27fa407bc606b58576712b16f3ac0900))


### Bug Fixes

* ac-1033: pagination twice in manage accounts ([f96391b](https://github.com/zextras/carbonio-admin-console-ui/commit/f96391ba97aa70b94e2675e07facf58ef117b245))
* ac-1033: scrolling issue for tables ([e232273](https://github.com/zextras/carbonio-admin-console-ui/commit/e23227303c4113e8185db8d8a960558bd93510d2))
* ac-413: sonar issues fixed ([403d220](https://github.com/zextras/carbonio-admin-console-ui/commit/403d220816664249d097876d50399be4d595d522))
* ac-413: sonar undefined issue on type declaration ([92a0e38](https://github.com/zextras/carbonio-admin-console-ui/commit/92a0e38c690fdb44c6dd3d6cb2c493a5492b4468))
* ac-969: fixed query for fetching only admin groups ([d19e874](https://github.com/zextras/carbonio-admin-console-ui/commit/d19e874f554a6eadd25402408554566de14c8acf))
* ac-981: validation for virtual host ([762cb7e](https://github.com/zextras/carbonio-admin-console-ui/commit/762cb7e6b6f1b49422a61298f03d117a25f998ac))
* ac-982: Enable and disable HSM policy use wrong attribute ([902cc40](https://github.com/zextras/carbonio-admin-console-ui/commit/902cc401289a6928e2c69b4a9a834ecb10ea46a1))
* ac-983: changing the cos at account level ([3942616](https://github.com/zextras/carbonio-admin-console-ui/commit/394261681fb18aed181bd911c614e70594de79ff))
* ac-983: resolved code smells ([6d0a356](https://github.com/zextras/carbonio-admin-console-ui/commit/6d0a356de30a1c189f92792f57cc3ba0480ad44c))
* ac-986: sonar qube fix custom table row factory ([3ba02a4](https://github.com/zextras/carbonio-admin-console-ui/commit/3ba02a44bbfacc334d8d9b07a6ba45898aff6a14))
* ac-987: fixed hover content factory sonar issue ([1a20b44](https://github.com/zextras/carbonio-admin-console-ui/commit/1a20b44e58bd7e9b31b8241b69948b827bc1d69b))
* ac-988: sonar qube fixed for operator change ([fce4d9f](https://github.com/zextras/carbonio-admin-console-ui/commit/fce4d9f71312f7f300cfc877f28370b5e31083ae))
* ac-989: fixed sonar qube domain details panel ([101cd8c](https://github.com/zextras/carbonio-admin-console-ui/commit/101cd8ce093196697d6c11f722a95b09a3541988))
* ac-990: conflicts resolved ([775d216](https://github.com/zextras/carbonio-admin-console-ui/commit/775d216303f6eedbefd70434adb49f4bb18668ee))
* ac-990: fixed sonar global details panel ([326b5c2](https://github.com/zextras/carbonio-admin-console-ui/commit/326b5c268b07f87e449e047c16d043bbd2a5b877))
* ac-991: fixed cognizive complexity sonar issue create resources ([aeb6a45](https://github.com/zextras/carbonio-admin-console-ui/commit/aeb6a45843a5f7a10eac6c55ee2e0cda2765bdd8))
* ac-991: fixed sonar issue create resource ([12a1cdf](https://github.com/zextras/carbonio-admin-console-ui/commit/12a1cdfbc38d810d60c355439abdd5a36268a05d))
* ac-992: fix sonar cognitive complexity and devel merged ([45d24a6](https://github.com/zextras/carbonio-admin-console-ui/commit/45d24a69065a76c7d4587926a2f38a7619ade486))
* ac-992: soner bug issue fixed resource edit details view ([139a239](https://github.com/zextras/carbonio-admin-console-ui/commit/139a23942e2024e25ba9cef8f368c036207fe5e2))
* ac-993: sonar fix quarantine list ([e520a06](https://github.com/zextras/carbonio-admin-console-ui/commit/e520a06419dc0849e5683afe3be24a548a23fd32))
* external AD tooltip port change ([#747](https://github.com/zextras/carbonio-admin-console-ui/issues/747)) ([ed07ca7](https://github.com/zextras/carbonio-admin-console-ui/commit/ed07ca78d6ae7fe7b992b2499bcf727ba03ba21c))
* file space quota for account ([#708](https://github.com/zextras/carbonio-admin-console-ui/issues/708)) ([e84486d](https://github.com/zextras/carbonio-admin-console-ui/commit/e84486dda5b465e6078fe901f4ae053f4b9d7f51))
* search result exceeded error handling ([#736](https://github.com/zextras/carbonio-admin-console-ui/issues/736)) ([99dafcb](https://github.com/zextras/carbonio-admin-console-ui/commit/99dafcb13f9a2dcd01141c34c02ae429318aeaaa))
* update quota panel to show files quota ([#738](https://github.com/zextras/carbonio-admin-console-ui/issues/738)) ([c71a05b](https://github.com/zextras/carbonio-admin-console-ui/commit/c71a05b5e32192d6ed6fa11f031a3d50398ddc22))

### [0.9.49](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.48...v0.9.49) (2024-05-20)

### [0.9.48](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.47...v0.9.48) (2024-05-15)


### Bug Fixes

* ac-1056: global active sync is only carbonio advance not for CE ([2b26426](https://github.com/zextras/carbonio-admin-console-ui/commit/2b264269d6a8d22d799777f06470672545787458))

### [0.9.47](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.46...v0.9.47) (2024-04-29)

### [0.9.46](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.45...v0.9.46) (2024-04-15)


### Bug Fixes

* ac-1012: acl rights account not filter correctly ([0d9a676](https://github.com/zextras/carbonio-admin-console-ui/commit/0d9a676a4d004189f1e943395b520d342109b700))

### [0.9.45](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.44...v0.9.45) (2024-04-12)


### Features

* ac-900 :allow global admin to manage global active sync settings(iteration-1) ([cc39b26](https://github.com/zextras/carbonio-admin-console-ui/commit/cc39b26a563a14cb0c99d7ac94f0f8655925c31d))
* ac-900: purge active sync ([a6a2bfc](https://github.com/zextras/carbonio-admin-console-ui/commit/a6a2bfc278cf63709e442722cf39a88380d522e5))
* ac-904: update server related mta attribute functionality added ([5b07edd](https://github.com/zextras/carbonio-admin-console-ui/commit/5b07edd244e850a0d920aeaa1de0f8efd60cf437))
* ac-925: inherited value functionality added in mta server attributes ([65eea28](https://github.com/zextras/carbonio-admin-console-ui/commit/65eea2800510213272bf589aca82f232dd8f6f32))
* ac-956: added mtomo events ([8b76af7](https://github.com/zextras/carbonio-admin-console-ui/commit/8b76af728140b1a1a963bbbec1d7f7cfae036cff))


### Bug Fixes

* ac-785: scrolling issue in tables for small screen ([60aa698](https://github.com/zextras/carbonio-admin-console-ui/commit/60aa698e056e11754577c425412a3e03138aa7a2))
* ac-900: fixed conflicts ([4008d55](https://github.com/zextras/carbonio-admin-console-ui/commit/4008d550352a9c5395006ee8b06e58fadf535c86))
* ac-914: conflicts resolved ([cfe627c](https://github.com/zextras/carbonio-admin-console-ui/commit/cfe627ca4f90e3ad9d32eb741acd8bb506486d96))
* ac-914: fixed edit account sonar cognitive complexity issue ([1325686](https://github.com/zextras/carbonio-admin-console-ui/commit/132568616067b87cfc78d2ff429c79285b0d6c9c))
* ac-914: fixed name field disable issue ([bfaf1c3](https://github.com/zextras/carbonio-admin-console-ui/commit/bfaf1c36c85c7ae069cf178a5095960576143e0e))
* ac-914: removed key from ErrorSnackbar since not used ([184b858](https://github.com/zextras/carbonio-admin-console-ui/commit/184b8580db9685e50e15683c3e4df569f0229f56))
* ac-956: conflicts resolved ([1eaa0d0](https://github.com/zextras/carbonio-admin-console-ui/commit/1eaa0d0b2c8fa1df19498058386b63dcfdacc082))
* ac-958: conflicts resolved with devel ([bad7759](https://github.com/zextras/carbonio-admin-console-ui/commit/bad7759c3182b7b1fafe174acc66b16f18d3ac43))
* ac-959: conflicts resolved with latest devel ([bef2092](https://github.com/zextras/carbonio-admin-console-ui/commit/bef2092e634195cce5c0dc580ec36cbe7790743a))
* ac-959: providing event name in matomo ([eb47926](https://github.com/zextras/carbonio-admin-console-ui/commit/eb47926620410b8db5d1811ab6fe809c7a4ef28b))
* ac-959: sonarqube improvements fixes ([ce6fbc2](https://github.com/zextras/carbonio-admin-console-ui/commit/ce6fbc2ab2620a0c38ea3caabfde3cf945b58c29))
* ac-960: mta advance and antispam design issue fix ([384765a](https://github.com/zextras/carbonio-admin-console-ui/commit/384765a0a28c7905bf314fd62a492c531cd07f4b))
* ac-960: mta postscreen banner height issue ([a3b39e9](https://github.com/zextras/carbonio-admin-console-ui/commit/a3b39e933cec798c1a2d3cb6936289a304c8f086))
* ac-963: fix it lang primary issue ([13e4e44](https://github.com/zextras/carbonio-admin-console-ui/commit/13e4e44ea94cc6387c18ca77aa9e8a8828e7ddb8))
* ac-978: create domain via admin UI insert wrong value ([67a99e8](https://github.com/zextras/carbonio-admin-console-ui/commit/67a99e8ca5d9a64dc01a7841dbba12beec5945ad))
* ac-984: sonar issue fix utils.ts ([fdcfeab](https://github.com/zextras/carbonio-admin-console-ui/commit/fdcfeab778e420a0940e056b71ccc26105e68a0f))
* ac-997: view mail button not display for deligated and domain admin ([0fdaba3](https://github.com/zextras/carbonio-admin-console-ui/commit/0fdaba341b1cd127eb93da2aed2df009b8773199))
* ac-xxx: duplicate route issue fix for mta ([1a22925](https://github.com/zextras/carbonio-admin-console-ui/commit/1a22925c4442dd49ba8ae318353b30a304f247b4))
* accounts and domains list labels in cos management ([#689](https://github.com/zextras/carbonio-admin-console-ui/issues/689)) ([fc29c83](https://github.com/zextras/carbonio-admin-console-ui/commit/fc29c83229bc6e599f5bcde1b79f10780b1dd248))
* change label in resource type ([#661](https://github.com/zextras/carbonio-admin-console-ui/issues/661)) ([04f48e6](https://github.com/zextras/carbonio-admin-console-ui/commit/04f48e632f2bb7dd6c2a72c43e6dbc357dc7bef1))
* create domain/cos disabled for delegated admin ([#690](https://github.com/zextras/carbonio-admin-console-ui/issues/690)) ([c8a311d](https://github.com/zextras/carbonio-admin-console-ui/commit/c8a311dafed964ba1e340fc0bc75d8f7f85dc4d1))
* delegated administration for account ([#675](https://github.com/zextras/carbonio-admin-console-ui/issues/675)) ([239f1ef](https://github.com/zextras/carbonio-admin-console-ui/commit/239f1efc0011ba7b53e9091d439b78ed1cf00be0))
* remove password option from create resource ([#673](https://github.com/zextras/carbonio-admin-console-ui/issues/673)) ([93cc6da](https://github.com/zextras/carbonio-admin-console-ui/commit/93cc6dac254a9bdaeb11defe49458812cf84e09a))
* show account/mailbox quota in Gb ([#674](https://github.com/zextras/carbonio-admin-console-ui/issues/674)) ([f11b842](https://github.com/zextras/carbonio-admin-console-ui/commit/f11b842320a006efe26c139a018da04675ff4234))

### [0.9.44](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.43...v0.9.44) (2024-03-07)

### [0.9.43](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.42...v0.9.43) (2024-02-15)


### Features

* ac-890: allow admin to update zimbraMtaSmtpdSenderLoginMaps ([14d24b7](https://github.com/zextras/carbonio-admin-console-ui/commit/14d24b756a4dd6809494b85b849e961624c4f86e))
* ac-905: if cos is enabled backup ([91b5596](https://github.com/zextras/carbonio-admin-console-ui/commit/91b5596c7e6d1850ff77ef8410889b130597c642))


### Bug Fixes

* ac-:923: improved fqdn invalid domain name allowance ([53796d4](https://github.com/zextras/carbonio-admin-console-ui/commit/53796d48225f234d3058c3186115f721bd4dfd92))
* ac-887: added valid hostname regular expression ([bdd71de](https://github.com/zextras/carbonio-admin-console-ui/commit/bdd71deb464d86f7d81404430cc1719c8850ef5c))
* ac-887: validation added in mta for space not allowd in anitivirus definition ([3445946](https://github.com/zextras/carbonio-admin-console-ui/commit/34459461ed1a8ff8f2cb3c1fbded1b6c42e2952e))
* ac-889: added space allow validation to my networks in mta ([2e97927](https://github.com/zextras/carbonio-admin-console-ui/commit/2e97927ce7b382e9aa3fa455c18afc611a981379))
* ac-889: fixed regex warning ([aef4f59](https://github.com/zextras/carbonio-admin-console-ui/commit/aef4f590347f996666c9ac2b0c0552e9dc360194))
* ac-889: improvised the regex to disallow more then 1 after / on ip range ([a9345f4](https://github.com/zextras/carbonio-admin-console-ui/commit/a9345f49e95c801614e305c30992e2af1e4bdb86))
* ac-889: removed extra space from api call ([1997501](https://github.com/zextras/carbonio-admin-console-ui/commit/199750124735b6d8269f1a38ea8299b244d33e2c))
* ac-905: import ordering fix after running test ([76eebaf](https://github.com/zextras/carbonio-admin-console-ui/commit/76eebaffe65b2930a688c6d4fe8d2cb386703e13))
* ac-905: removed unused interface ([becae73](https://github.com/zextras/carbonio-admin-console-ui/commit/becae731e76d770edc1c156fc35bcafbd690d3fa))
* ac-915: mta outbound flow list only mta server ([a9a53a7](https://github.com/zextras/carbonio-admin-console-ui/commit/a9a53a7d7e2dc266fd82da4fa2121ed0c5247455))
* ac-919: added grant request when init domain for deligated admin ([297ac52](https://github.com/zextras/carbonio-admin-console-ui/commit/297ac5278a27206a82b342f17ab5581499ccb26a))
* ac-919: domain admin not change users cos ([99063f4](https://github.com/zextras/carbonio-admin-console-ui/commit/99063f4f6b07a1d8c1de0ee8d8e8fc309b2cf026))
* ac-921: check color schema is valid color or not ([b0faf56](https://github.com/zextras/carbonio-admin-console-ui/commit/b0faf56a212292faea7e2f78e2c9c69ae1b83b4a))
* ac-9905: fixed ui bug for enable disable switch save button ([8dc6abc](https://github.com/zextras/carbonio-admin-console-ui/commit/8dc6abc07451093b628751c76ac7f8de90e4a4b2))
* show implement forget password link configuration ([#656](https://github.com/zextras/carbonio-admin-console-ui/issues/656)) ([8a13fbf](https://github.com/zextras/carbonio-admin-console-ui/commit/8a13fbfb394a0859c99620b3e408ca402a2d8958))

### [0.9.42](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.41...v0.9.42) (2024-01-12)


### Features

* ac-903: changed default page opening to server list ([6a0e2cc](https://github.com/zextras/carbonio-admin-console-ui/commit/6a0e2ccb287a600146a849aca3711289ea9d24a0))

### [0.9.41](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.40...v0.9.41) (2024-01-11)


### Bug Fixes

* ac-795: duplicate value remove from translation ([51b6f3a](https://github.com/zextras/carbonio-admin-console-ui/commit/51b6f3a2fbfff6f70ffbb0975a712b6343ffd320))
* allow domain admin to configure recovery email ([#622](https://github.com/zextras/carbonio-admin-console-ui/issues/622)) ([1458237](https://github.com/zextras/carbonio-admin-console-ui/commit/145823704978b6f651e7c8eaf5c071f750495760))

### [0.9.40](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.39...v0.9.40) (2024-01-04)


### Features

* ac-533: manage domain disclaimer and global disclaimer ([e7660e5](https://github.com/zextras/carbonio-admin-console-ui/commit/e7660e5001e207b02a97b3502b50aa7c85b4c18f))


### Bug Fixes

* ac-906: regex improvivized for fqdn ([ae71168](https://github.com/zextras/carbonio-admin-console-ui/commit/ae71168e509e2ff51e14533a23a525cdde7faf3b))
* login background image description ([#614](https://github.com/zextras/carbonio-admin-console-ui/issues/614)) ([79c0e61](https://github.com/zextras/carbonio-admin-console-ui/commit/79c0e6142c3e6bb6fc01a7df3de4e9bf41befb7e))

### [0.9.39](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.38...v0.9.39) (2023-12-14)


### Features

* ac-733: changed names and added new attributes for login ([a362ce4](https://github.com/zextras/carbonio-admin-console-ui/commit/a362ce4a945b17d97ef8b373b14d77eaa52d460e))
* ac-849: store closed or open tabs memory into local storage ([748b7de](https://github.com/zextras/carbonio-admin-console-ui/commit/748b7de74a10f781aaa90c163095279ea805196f))
* ac-894: added multiple virtualhost creation ([562160b](https://github.com/zextras/carbonio-admin-console-ui/commit/562160b10b926785f1785e971309645f9fd70e6a))


### Bug Fixes

* ac-818: eslint ignore type error for backup ([e8af96d](https://github.com/zextras/carbonio-admin-console-ui/commit/e8af96d17af21fabb8bde4328786fca4f0035768))
* ac-859: global setting not editable ([1e0d3a9](https://github.com/zextras/carbonio-admin-console-ui/commit/1e0d3a9750e5fd08de576283962d415b5d9978b3))
* ac-871: fixed mailing list subdomain dashed data issue ([415b265](https://github.com/zextras/carbonio-admin-console-ui/commit/415b265ede49942d627c6e2643f4b1302376ed50))
* ac-884: key changed to display compression fixed ([f92a036](https://github.com/zextras/carbonio-admin-console-ui/commit/f92a0367817527643ceb19ccb8f5a67a823f9607))

### [0.9.38](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.37...v0.9.38) (2023-11-28)


### Bug Fixes

* ac-885: update attribute wrong way in mta virus defination ([8a99cdf](https://github.com/zextras/carbonio-admin-console-ui/commit/8a99cdfc1c082f4f7f31459157ff081681d0ce1c))
* ac-886: remove sentense untill login page not manage virutal host ([9a18ba0](https://github.com/zextras/carbonio-admin-console-ui/commit/9a18ba0fa0526ae2ab4e5d60f89882b453506698))

### [0.9.37](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.36...v0.9.37) (2023-11-23)

### [0.9.36](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.35...v0.9.36) (2023-11-23)


### Features

* ac-317: added done tab in the UI with getoperationlog api ([906ae94](https://github.com/zextras/carbonio-admin-console-ui/commit/906ae94ab43b0fb2e0f48f29a6861207828b42be))
* ac-840 : cos list in cos tab ([c72e535](https://github.com/zextras/carbonio-admin-console-ui/commit/c72e5358807c397a5eec34679bede8d0a10c6f72))
* ac-842: add default cos selection in create domain ([63e39e5](https://github.com/zextras/carbonio-admin-console-ui/commit/63e39e5c8c2dc4a4eea104f9d88d43b67dcccf3b))
* added done tabs along with removed cancel operation and custom details page ([761964c](https://github.com/zextras/carbonio-admin-console-ui/commit/761964ce461c71a79bc4db33a7f04f2c0943fe25))


### Bug Fixes

* ac-317: filter renderring issue fixed ([d87d921](https://github.com/zextras/carbonio-admin-console-ui/commit/d87d9218ea5bf70b58b08c1d277d4cb230e39c06))
* ac-317: removed theme constant ([d330d1a](https://github.com/zextras/carbonio-admin-console-ui/commit/d330d1aa9ff47d0472b8b241f89f05d667d645b7))
* ac-826: dashboard notification not show latest notificaiton ([2c3fb40](https://github.com/zextras/carbonio-admin-console-ui/commit/2c3fb400c28653b5484dbc3de57a5d73a95e64ce))
* ac-830: session filter and end session not working ([8d30682](https://github.com/zextras/carbonio-admin-console-ui/commit/8d3068249692e5c013725b6e26fdaf6d5f036d73))
* ac-838: mailbox quota display all domain record rather than selected domain ([5a15801](https://github.com/zextras/carbonio-admin-console-ui/commit/5a1580185b8c0a8aeba55a6789ae71bbd1a8e441))
* ac-850: added regular expression for valid extesion allowed ([a5dc095](https://github.com/zextras/carbonio-admin-console-ui/commit/a5dc095555f49b47623eca083b333e78ac6673ef))
* ac-850: value not update properly in mta extension ([1004ccc](https://github.com/zextras/carbonio-admin-console-ui/commit/1004cccb30bcce086d5aaac784c9222c2c9fbdb1))
* cos link issue on domain general setting ([#566](https://github.com/zextras/carbonio-admin-console-ui/issues/566)) ([9d10ed9](https://github.com/zextras/carbonio-admin-console-ui/commit/9d10ed964cbe8b6cc4dbe36543dd8de793eb29c5))
* lint issues ([8099e0a](https://github.com/zextras/carbonio-admin-console-ui/commit/8099e0ab305bbcadb0eb93c8a765c5d2138cd79b))
* sonarcube bug fix ([b2ca62e](https://github.com/zextras/carbonio-admin-console-ui/commit/b2ca62ed15cfdec4cab33ac9fffd0b0c7cd7be73))
* translation issue ([#557](https://github.com/zextras/carbonio-admin-console-ui/issues/557)) ([3a6ae2b](https://github.com/zextras/carbonio-admin-console-ui/commit/3a6ae2bc0bd465ebf701ba2be2ad1f2e1059f245))
* update zustand store and DS issues ([39ea3e8](https://github.com/zextras/carbonio-admin-console-ui/commit/39ea3e8aea512071b8cab27acc6d4d60cf48cc0b))
* whitelabel login background description ([8f98bfb](https://github.com/zextras/carbonio-admin-console-ui/commit/8f98bfbd2c0f717fb785aff64dfc89207ad57ee4))

### [0.9.35](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.34...v0.9.35) (2023-11-10)


### Bug Fixes

* ac-789: general setting and mailbox quota field disable in case of deligated admin ([50cfab7](https://github.com/zextras/carbonio-admin-console-ui/commit/50cfab74a11a91740847cb6db4e514a45d69ebdc))
* ac-789: global admin should able to update max manageable account ([2168d13](https://github.com/zextras/carbonio-admin-console-ui/commit/2168d13ce326558512702f8190decf7b130a72ed))
* ac-789: max managable account should be readonly ([fe7842a](https://github.com/zextras/carbonio-admin-console-ui/commit/fe7842acc361f0745f5dd16c2e9da0796742fc6b))

### [0.9.34](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.33...v0.9.34) (2023-11-07)

### [0.9.33](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.32...v0.9.33) (2023-10-26)


### Features

* ac-390: added certificate uploading fixes extension pending and merged with devel ([d28d292](https://github.com/zextras/carbonio-admin-console-ui/commit/d28d2921ba587ef9da7768d9aaa0a8a5a87c807a))
* ac-653: allow Global Admin to list all global and delegated admin in the infrastructure ([5ff1b0c](https://github.com/zextras/carbonio-admin-console-ui/commit/5ff1b0c6608973b53c973f6be464b23e2e33f697))
* email mta mail queue list and operation on mail added ([2cd7571](https://github.com/zextras/carbonio-admin-console-ui/commit/2cd7571a32ef33808ddabf0742099f864eb8098b))
* get list of mail from differnt queue ([d81f4c6](https://github.com/zextras/carbonio-admin-console-ui/commit/d81f4c6141b18ac3ecc9f03fa14190ffb92b09bf))
* refactored name surname and middle name field and email creation ([d2eb0f4](https://github.com/zextras/carbonio-admin-console-ui/commit/d2eb0f4675aa4a073c642adb8fde8843c7443002))


### Bug Fixes

* ac-390: added pem extension to certificate files ([58d8713](https://github.com/zextras/carbonio-admin-console-ui/commit/58d8713bb847c080d442230964e8f2abcdca4f78))
* ac-390: clear the certificate content on reupload ([0f2d0fa](https://github.com/zextras/carbonio-admin-console-ui/commit/0f2d0fa3d81d21c80095705f29b38eefdc29c8f4))
* ac-796: paging not working properly ([bc09333](https://github.com/zextras/carbonio-admin-console-ui/commit/bc09333b5101bfa6f0b277fa1755346a2e19e851))
* ac-808: enable schedule toggled in hsm not working ([0d65766](https://github.com/zextras/carbonio-admin-console-ui/commit/0d657663decd43e944894c0b28c276d325019c72))
* ac-829: mta queue showing wrong date after scan server ([520f004](https://github.com/zextras/carbonio-admin-console-ui/commit/520f004e0a9884ca12966b5f2e99a1144f2ca46b))
* conflicts resolved ([e499dea](https://github.com/zextras/carbonio-admin-console-ui/commit/e499dea9a97ad0d6a8a98f204fb8ca4702e55707))
* domains redirect routing fixed ([67f8b81](https://github.com/zextras/carbonio-admin-console-ui/commit/67f8b81f6522952e4617156db66d0f47d231de1f))
* download changes and extension changed ([9540dfc](https://github.com/zextras/carbonio-admin-console-ui/commit/9540dfc4172a31415513e523dc540c92c7e19378))
* fixed domain undefined error ([0970755](https://github.com/zextras/carbonio-admin-console-ui/commit/09707559a329ca1b8f8552202c763bc4f97e2c53))
* quickaccess button from the dashboard ([c2a7879](https://github.com/zextras/carbonio-admin-console-ui/commit/c2a7879a6311718053983db897e2e618ac277ba9))
* setup unit testing env ([#531](https://github.com/zextras/carbonio-admin-console-ui/issues/531)) ([ed241ba](https://github.com/zextras/carbonio-admin-console-ui/commit/ed241ba65723dcd6d0cddb32aec8580be2f37715))

### [0.9.32](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.31...v0.9.32) (2023-10-10)

### [0.9.31](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.30...v0.9.31) (2023-09-29)


### Features

* ac-473: track total iteam each page display ([33ce032](https://github.com/zextras/carbonio-admin-console-ui/commit/33ce032e5877572561879a4c639f579f173edc03))
* ac-488: mta logging advance functionality added ([11caac6](https://github.com/zextras/carbonio-admin-console-ui/commit/11caac65cbc3ff63af6b8858df854f0008e79e06))
* ac-728: mail queue flush server added ([884094c](https://github.com/zextras/carbonio-admin-console-ui/commit/884094ca1c49b3c04fd69c97163096a80cedbdbf))
* ac-728: mta queue status and request cache flush implement ([7d4042c](https://github.com/zextras/carbonio-admin-console-ui/commit/7d4042ca29886e28b75c1609aa2730abc113c6b7))
* added feature of logging uuid to matomo ([01576a0](https://github.com/zextras/carbonio-admin-console-ui/commit/01576a027e0024f395abbe55a37543f1e6f0e3c9))
* allow admin to manage both description and notes attribute ([a88eb1e](https://github.com/zextras/carbonio-admin-console-ui/commit/a88eb1e54f0bab1ff31b8c13a27cbface130431c))
* changed matomo url ([670f453](https://github.com/zextras/carbonio-admin-console-ui/commit/670f453ada3829a2fd40854cecb0aef42fa77d23))
* loader for api call ([46c1fd7](https://github.com/zextras/carbonio-admin-console-ui/commit/46c1fd7a9443b898384c65e4f57736f88e3722e4))
* mapping value to design fields ([2f40464](https://github.com/zextras/carbonio-admin-console-ui/commit/2f40464c38966169381b0a9cc65d5df5bc41fdb1))
* mta postscreen save attribute functionality added ([6387e73](https://github.com/zextras/carbonio-admin-console-ui/commit/6387e736820ae052679bce5959682b9957ae9491))
* postscreen action tuning added ([825f944](https://github.com/zextras/carbonio-admin-console-ui/commit/825f944f6f8a2719b216c823e0ee8d8a9fec5fae))


### Bug Fixes

* ac-470: hsm policy error handling added ([b995de7](https://github.com/zextras/carbonio-admin-console-ui/commit/b995de79971cba8e65dc9bc6aa1fc14ef2bd62d6))
* ac-696: fix add setting option in cos/account ([#500](https://github.com/zextras/carbonio-admin-console-ui/issues/500)) ([a407288](https://github.com/zextras/carbonio-admin-console-ui/commit/a4072886f98e94168c0e80a7279aa904d09481f1))
* ac-758: duplicate virus extension added in common blocked extension ([5c5e1af](https://github.com/zextras/carbonio-admin-console-ui/commit/5c5e1af27a163b73e85ce0cf7de759656cf6923a))
* ac-763: fix spam prefix subject tag issue ([#485](https://github.com/zextras/carbonio-admin-console-ui/issues/485)) ([c593768](https://github.com/zextras/carbonio-admin-console-ui/commit/c593768964e989bdb8b8727a517a5e6e56ae9119))
* ac:740: error handling in run hsm policy only ([e52bc97](https://github.com/zextras/carbonio-admin-console-ui/commit/e52bc97651f8afb3838e5ac4bd1a79f004e6b58c))
* account detail view update after edit accout ([94fc2dd](https://github.com/zextras/carbonio-admin-console-ui/commit/94fc2dd22672e6ccd855734bda6ee3734ab96596))
* change px to rem in margin ([493ca0b](https://github.com/zextras/carbonio-admin-console-ui/commit/493ca0b062024fd311ac3837a781a0c72434fd73))
* changed px to rem and updated media query ([ee2fe61](https://github.com/zextras/carbonio-admin-console-ui/commit/ee2fe616b46ab9c5f3f2a81f8c036cf82729bfbd))
* fixed from backup module icon ([17bd9b5](https://github.com/zextras/carbonio-admin-console-ui/commit/17bd9b51cbf2fe5a0e227822a0fe840b96e81792))
* fixed password not emptying issue ([2159262](https://github.com/zextras/carbonio-admin-console-ui/commit/21592621436c06d9afaa3cd8a3e0713ae8bc9e91))
* fixed removal of add and remove buttons on delegates ([300b1aa](https://github.com/zextras/carbonio-admin-console-ui/commit/300b1aa6a973e05dcc41681cc300b113e6769d3c))
* matomo variables converted to constant ([2cc2722](https://github.com/zextras/carbonio-admin-console-ui/commit/2cc272209802e3d0b097237a77a595ba1d936dbc))
* removed href to tracking urls on all logs ([557fd73](https://github.com/zextras/carbonio-admin-console-ui/commit/557fd73613caf4f1a7b31ca88e09de18b12dd1c8))
* removed remove buttons from delegates ([ba40d35](https://github.com/zextras/carbonio-admin-console-ui/commit/ba40d3556f7a46895cf6cee010c7673359dc8a5d))
* removed unused string ([#517](https://github.com/zextras/carbonio-admin-console-ui/issues/517)) ([d7ddd17](https://github.com/zextras/carbonio-admin-console-ui/commit/d7ddd17d0334d993ec0ddf2529855450e892020d))
* removed unused translation key ([2d57516](https://github.com/zextras/carbonio-admin-console-ui/commit/2d5751649ca82268154530c854c9e5115e3c8470))
* resolve conflict ([6169ed8](https://github.com/zextras/carbonio-admin-console-ui/commit/6169ed834d5881d6a30b5ea6440a383486bd972a))
* resolve conflict ([31a10ba](https://github.com/zextras/carbonio-admin-console-ui/commit/31a10baecd3c27cb621a5dd3a7d5add1956e548d))
* run all hsm policy error handling added ([c65c4bf](https://github.com/zextras/carbonio-admin-console-ui/commit/c65c4bf4207e6ce6329f6a15bceca9aa6a8bc5c8))
* subscription name does not display properly ([893fa5d](https://github.com/zextras/carbonio-admin-console-ui/commit/893fa5da6364fde25c9b827c09403a28102a8700))
* translation updated for name for every module ([5a107af](https://github.com/zextras/carbonio-admin-console-ui/commit/5a107afad645af40467f8a8a7f1df72cb07eab06))
* typo on recipient and qualified terms ([#492](https://github.com/zextras/carbonio-admin-console-ui/issues/492)) ([127628f](https://github.com/zextras/carbonio-admin-console-ui/commit/127628fcb1c170ce085f37fa704d682cfa8f1dbb))

### [0.9.30](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.29...v0.9.30) (2023-09-29)


### Bug Fixes

* ac-797: backup module not open in admin ui ([36bbbbc](https://github.com/zextras/carbonio-admin-console-ui/commit/36bbbbc575b1cc7d77dded0ad8d3dcb8a7e2dcd9))
* on backup save getting error ([487a90a](https://github.com/zextras/carbonio-admin-console-ui/commit/487a90a3e642dff984013547b2f6048a231731e0))

### [0.9.29](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.28...v0.9.29) (2023-09-22)


### Bug Fixes

* enabled delegates and added list of delegate account ([c2a3857](https://github.com/zextras/carbonio-admin-console-ui/commit/c2a38577e996dcb65ae85989b9b95faf8680677f))

### [0.9.28](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.27...v0.9.28) (2023-09-21)


### Bug Fixes

* commented delegates to avoid using bad feature ([c47cf7a](https://github.com/zextras/carbonio-admin-console-ui/commit/c47cf7a0e4c07065185b56fdda7f88738cc89815))

### [0.9.27](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.26...v0.9.27) (2023-09-12)

### [0.9.26](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.25...v0.9.26) (2023-08-31)


### Features

* adde notification fields ([b1afd01](https://github.com/zextras/carbonio-admin-console-ui/commit/b1afd01f3612899728452158e02a664ff30d931e))
* added feature for enabling domain delegation ([3cc2fe0](https://github.com/zextras/carbonio-admin-console-ui/commit/3cc2fe0f4df265f2aad6ecafa35225f5b6255a0e))
* added fields to domain details also ([39aa039](https://github.com/zextras/carbonio-admin-console-ui/commit/39aa039018a57f582d857265f16a93e8e361a582))
* added re-sync feature in galsync ([07ea2af](https://github.com/zextras/carbonio-admin-console-ui/commit/07ea2afa75c30002f15feb0fab59a93b362fc4a8))
* allow Global and delegate admin to mark an account as delegated admin ([bf3790a](https://github.com/zextras/carbonio-admin-console-ui/commit/bf3790a2462eb7d8ad7d74e5f5a0172a73175399))
* provide a standard details behaviour and appearance ([f4cc7d8](https://github.com/zextras/carbonio-admin-console-ui/commit/f4cc7d8319caa746f045c3595014e48ef31e0ec5))
* updated the fields ([cc8fa33](https://github.com/zextras/carbonio-admin-console-ui/commit/cc8fa334bf76a0a0f8f695bb7f6377da6e6f151e))


### Bug Fixes

* ac-686: add custom logout into theme ([#477](https://github.com/zextras/carbonio-admin-console-ui/issues/477)) ([51df919](https://github.com/zextras/carbonio-admin-console-ui/commit/51df919dd29516c4cb07310ad7d90b4911fe29df))
* ac-737: add read receipt pref in cos/account ([#469](https://github.com/zextras/carbonio-admin-console-ui/issues/469)) ([6bbe4fb](https://github.com/zextras/carbonio-admin-console-ui/commit/6bbe4fb55be1e50406aa09cce33948095df1b413))
* ac-742: notes label replace with description ([9c3a012](https://github.com/zextras/carbonio-admin-console-ui/commit/9c3a0124307f40b271d0e228995924915cd27312))
* ac-748: mta panel not avaiable on carbonio ce ([f0af8fe](https://github.com/zextras/carbonio-admin-console-ui/commit/f0af8fe4579658d594a67c16adaa850eeaeff265))
* ac-760: fix issue of mailing list and security groups ([#468](https://github.com/zextras/carbonio-admin-console-ui/issues/468)) ([4d2126b](https://github.com/zextras/carbonio-admin-console-ui/commit/4d2126b5d38e17ac85e27ddef20bc9c1984f0f89))
* ac-770: public service hostname change not working ([086431c](https://github.com/zextras/carbonio-admin-console-ui/commit/086431c6ef60fe3e3d5ab6f048d62a3f0dd7306b))
* bugs related to delegate administrator ([4249a30](https://github.com/zextras/carbonio-admin-console-ui/commit/4249a302a52c5a5ffdb8535ce5b4c04fce745a1d))
* change event not working in active sync ([411ee76](https://github.com/zextras/carbonio-admin-console-ui/commit/411ee765e326bc4a39d33db7cd4ce89fee3a1428))
* changed ceph s3 to ceph only ([a8063fa](https://github.com/zextras/carbonio-admin-console-ui/commit/a8063fab0bd92b7269b3544dacd8966d97a2641f))
* conflicts resolved ([377d39b](https://github.com/zextras/carbonio-admin-console-ui/commit/377d39b2aab4e379861810defae447a8de64e616))
* conflicts resolved ([d2791e9](https://github.com/zextras/carbonio-admin-console-ui/commit/d2791e90e45e66133231ffd4c677b6f7fc3b78bb))
* correct email to create otp ([eab6e5c](https://github.com/zextras/carbonio-admin-console-ui/commit/eab6e5c388b8520618c9f923f95a08051811938f))
* edit account tab ([cc23157](https://github.com/zextras/carbonio-admin-console-ui/commit/cc2315759eed9ebaa1fc237e39d117f71b384f57))
* email address did not pass in request attribute ([433c8bb](https://github.com/zextras/carbonio-admin-console-ui/commit/433c8bb1603a36f24acaf6da647029ff510462af))
* few required changes ([f8aaefe](https://github.com/zextras/carbonio-admin-console-ui/commit/f8aaefed553b193665a661afbac9743c14063f98))
* fixed any type change ([d14fa7e](https://github.com/zextras/carbonio-admin-console-ui/commit/d14fa7ec844ec55c399c8d6e7a4f71fffd1a3779))
* fixed success message shown ([0e4d024](https://github.com/zextras/carbonio-admin-console-ui/commit/0e4d0248a6b568e7c1de62d548e66b71d0279277))
* hide all the help and documentation links and buttons that provide no link or documentation ([d1091c5](https://github.com/zextras/carbonio-admin-console-ui/commit/d1091c5c2e9d796460152788c8c79a207be9fef7))
* multi selection issue of table filter ([20ff2b0](https://github.com/zextras/carbonio-admin-console-ui/commit/20ff2b061df66adb147e24c2d7bde7110d0bdad9))
* not able to save administrations changes for an account ([665af39](https://github.com/zextras/carbonio-admin-console-ui/commit/665af39aaf5c6e717117a2abd2b68c2198820f9b))
* np-630:add run hsm custom policy ([#446](https://github.com/zextras/carbonio-admin-console-ui/issues/446)) ([db874bc](https://github.com/zextras/carbonio-admin-console-ui/commit/db874bc955f9d9b667ee17c229e6297598faec6c))
* np-751: fix show wrong account quota information ([#454](https://github.com/zextras/carbonio-admin-console-ui/issues/454)) ([776778b](https://github.com/zextras/carbonio-admin-console-ui/commit/776778b3f8bdeedf5d1836f2998774b37aa20ac3))
* owner ship issue has been fix ([ba83df8](https://github.com/zextras/carbonio-admin-console-ui/commit/ba83df8d8807076c5381af2f36ecbf7678f5cd4c))
* related to administaration tab ([bac969f](https://github.com/zextras/carbonio-admin-console-ui/commit/bac969f57600890245054fc5109236bf76265f1b))
* remoevd string from en.json after run ([1ed0ef4](https://github.com/zextras/carbonio-admin-console-ui/commit/1ed0ef40c1c4f02a6f30e206e64b70ff986793e0))
* remove duplicate prevent change password option ([#432](https://github.com/zextras/carbonio-admin-console-ui/issues/432)) ([93a1500](https://github.com/zextras/carbonio-admin-console-ui/commit/93a1500bae13dddd49a33ec3b5af3347a27d0ce3))
* remove owner from send to list based on type ([508e213](https://github.com/zextras/carbonio-admin-console-ui/commit/508e21374fffdf4b318ac6c68dffef96d635f5c2))
* remove padding and scroll ([64b3579](https://github.com/zextras/carbonio-admin-console-ui/commit/64b35790d0f200d208d7f13967a658a83fa74164))
* removed comment code ([474cfdc](https://github.com/zextras/carbonio-admin-console-ui/commit/474cfdc20a23c7064e5a76219491d7a3d9f1a9ad))
* removed fields from create domain ([78c178b](https://github.com/zextras/carbonio-admin-console-ui/commit/78c178b0343f965192e49c6e8e5bdaa17c8c4fc3))
* removed link from general settings ([ae9d8c0](https://github.com/zextras/carbonio-admin-console-ui/commit/ae9d8c03409691d7d47dac1f8938eb40c202aa54))
* removed sideModal and console ([1dfd9a2](https://github.com/zextras/carbonio-admin-console-ui/commit/1dfd9a2d3288d09166507b5df029ea33706dd44f))
* single email getting issue in grantee list ([6b82136](https://github.com/zextras/carbonio-admin-console-ui/commit/6b82136d36b932600158e9145b151dfb39d045f9))
* style fixes as per ds ([0c2f6e0](https://github.com/zextras/carbonio-admin-console-ui/commit/0c2f6e011afaa4595b935d4bf0f81935252b6466))
* translation added ([5d30d87](https://github.com/zextras/carbonio-admin-console-ui/commit/5d30d876d42ce6db098e5690352bcb124cf1e7ea))
* translation not coming issue ([7fd866a](https://github.com/zextras/carbonio-admin-console-ui/commit/7fd866a25a2c075ce583738d8325ca62f6735c3e))
* type fixed ([d38e629](https://github.com/zextras/carbonio-admin-console-ui/commit/d38e62921b6b6b8efcbfac23f4919f05dde902d1))
* update translation with neccessary change ([494129d](https://github.com/zextras/carbonio-admin-console-ui/commit/494129df3cc96a17feb0ddeec4bd917f6303ea27))

### [0.9.25](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.24...v0.9.25) (2023-07-20)

### [0.9.24](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.23...v0.9.24) (2023-07-14)


### Bug Fixes

* replaced dropdown with dropdowninput ([#433](https://github.com/zextras/carbonio-admin-console-ui/issues/433)) ([66f3de9](https://github.com/zextras/carbonio-admin-console-ui/commit/66f3de995f8692fba05357bed7e3925e82845148))

### [0.9.23](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.22...v0.9.23) (2023-07-06)


### Features

* added feature to display certificate details ([2d8db7a](https://github.com/zextras/carbonio-admin-console-ui/commit/2d8db7a83d31c486740a7cf2862265b2d7677acc))
* added feature to use letencrypt and copy paste raw content ([7889ff3](https://github.com/zextras/carbonio-admin-console-ui/commit/7889ff3e84fa68880f1d87e007acb50abc3e814e))
* added modify policy changes ([790a4d5](https://github.com/zextras/carbonio-admin-console-ui/commit/790a4d5ee417c02a672b80e4a0fc872d6a8d4e3b))
* added Ui and list policies ([6444758](https://github.com/zextras/carbonio-admin-console-ui/commit/6444758d7f6246a14bd860195d164876483513ab))
* allowed admin to configure 2fa global and domain ([dca6076](https://github.com/zextras/carbonio-admin-console-ui/commit/dca6076976d8b51201771446b2c72bd33d4907f9))
* amavis anivirus check attribute added in mta ([5dabf77](https://github.com/zextras/carbonio-admin-console-ui/commit/5dabf77e0586696c7e6ccc852fd3f79507f52e88))


### Bug Fixes

* checked new message with backend messages ([aae2761](https://github.com/zextras/carbonio-admin-console-ui/commit/aae27619ee5ae706c5c5e2dbb4255f50ee5f3942))
* conflict resolved ([d063c33](https://github.com/zextras/carbonio-admin-console-ui/commit/d063c33a4b415069d9d15cc1190aace4c03c471b))
* conflicts resolved ([938d744](https://github.com/zextras/carbonio-admin-console-ui/commit/938d744b5552049d65fe920ba1fbf544f4f77940))
* conflicts resolved ([9c7744c](https://github.com/zextras/carbonio-admin-console-ui/commit/9c7744ce481f1f7858186ee0909b221edeb3e833))
* conflicts resolved ([55cf7a5](https://github.com/zextras/carbonio-admin-console-ui/commit/55cf7a50b249c685ee6aa4b0360bc631dbf597d3))
* default 0 compression threshold ([cbe22cf](https://github.com/zextras/carbonio-admin-console-ui/commit/cbe22cf80f2ef61718911789927128cb0b11ee2f))
* default show mesure unit in cos advance ([#394](https://github.com/zextras/carbonio-admin-console-ui/issues/394)) ([5c8f309](https://github.com/zextras/carbonio-admin-console-ui/commit/5c8f309c9d67ba0c2b42cda1db7d0f9d0a71c31c))
* disable search ([841065e](https://github.com/zextras/carbonio-admin-console-ui/commit/841065eb03154158c8b173e6f14d62a7d7f31787))
* fixed emptying ip range ([cccbd4b](https://github.com/zextras/carbonio-admin-console-ui/commit/cccbd4b0e549c0147475537d77765682f3e0b2f0))
* fixed error message from backend ([ac274bb](https://github.com/zextras/carbonio-admin-console-ui/commit/ac274bba462c1dc26877d654f84dca1e3f15fbe5))
* fixed error snackbar ([9988abb](https://github.com/zextras/carbonio-admin-console-ui/commit/9988abba5e4b50c02545c55fad42f89d892d1227))
* fixed leading 0 ip range regex ([6cd1d70](https://github.com/zextras/carbonio-admin-console-ui/commit/6cd1d700b200a6221c66f2a601f365f4b9085a5a))
* fixed list bucket proxy server issue ([8305d2e](https://github.com/zextras/carbonio-admin-console-ui/commit/8305d2e1fb5293915433f19129020bb944c23204))
* fixed only one value updating issue ([2630138](https://github.com/zextras/carbonio-admin-console-ui/commit/2630138a093d7fcd6d35ed03291825fd75c2f0ad))
* fixed px to rem issue ([48b288f](https://github.com/zextras/carbonio-admin-console-ui/commit/48b288ff440966203bb309fb459922beba359fe2))
* fixed un necessary snackbar removal ([b672261](https://github.com/zextras/carbonio-admin-console-ui/commit/b672261f6ff21352dcb7819e24ed901c1dfc510f))
* fixed volume threhold update and defined types ([d65058b](https://github.com/zextras/carbonio-admin-console-ui/commit/d65058be1733abce079d98d06acbee2272bec243))
* fixed with new layout smooth button show ([c1d2470](https://github.com/zextras/carbonio-admin-console-ui/commit/c1d247082c4a1888bca0de6af19068ff576d12fd))
* remove double api call for getallservers ([51bcb6b](https://github.com/zextras/carbonio-admin-console-ui/commit/51bcb6b49653b6ba82dfbcb14e427821b0fb64b9))
* reverted old backup and fixed ([33f2d3c](https://github.com/zextras/carbonio-admin-console-ui/commit/33f2d3cec54a12c5bccd0c3c80bf1fa0d7619f45))
* run all hsm policies ([f3f6e1a](https://github.com/zextras/carbonio-admin-console-ui/commit/f3f6e1aa170a10442f1708b3dfac688c3c8734eb))
* saml option remove if carbonio CE avaiable ([3e24dc5](https://github.com/zextras/carbonio-admin-console-ui/commit/3e24dc521e7203e3f7d582809e10043e8b856f29))
* trans string issue ([#414](https://github.com/zextras/carbonio-admin-console-ui/issues/414)) ([e3dcc04](https://github.com/zextras/carbonio-admin-console-ui/commit/e3dcc0418be4a7930a51d81ab0e0ec29ffe4b6a5))
* type for policy array ([61897a4](https://github.com/zextras/carbonio-admin-console-ui/commit/61897a4bcf853bc662edf6ab1f7cb5a0c295ab3a))

### [0.9.22](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.21...v0.9.22) (2023-06-16)


### Bug Fixes

* fixed bucket label and item value undefined error ([a843298](https://github.com/zextras/carbonio-admin-console-ui/commit/a84329818cf2065859ea749a9ccf7f208f1d31ac))

### [0.9.21](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.20...v0.9.21) (2023-06-09)


### Bug Fixes

* update chats enable/disable field ([#401](https://github.com/zextras/carbonio-admin-console-ui/issues/401)) ([ee60336](https://github.com/zextras/carbonio-admin-console-ui/commit/ee60336bfe60c0b2076cb3e65775771111a7499a))

### [0.9.20](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.12...v0.9.20) (2023-05-25)


### Features

* add primary color configuration ([#301](https://github.com/zextras/carbonio-admin-console-ui/issues/301)) ([e663d4b](https://github.com/zextras/carbonio-admin-console-ui/commit/e663d4b4d8a31c835035efdb76745034d4f9258e))
* added create destroy galsync account ([35e6c30](https://github.com/zextras/carbonio-admin-console-ui/commit/35e6c3050e6a1dbca84274dbaffa97e24ab70762))
* added dn settings ([458f25c](https://github.com/zextras/carbonio-admin-console-ui/commit/458f25c1e74aa8e02b640f8e9122e47733071b3f))
* added feature for external gal ldpa url ([5eaaad8](https://github.com/zextras/carbonio-admin-console-ui/commit/5eaaad8a2cd8b85bc269bff2f646361039b0a8e5))
* added feature to check and veriify auth h in active directory ([06e7bdc](https://github.com/zextras/carbonio-admin-console-ui/commit/06e7bdc32c4f9bb9824c3adde6c621efe2d46cf2))
* common extension fill inside block extension ([9652134](https://github.com/zextras/carbonio-admin-console-ui/commit/9652134bf229265576d18ff5b964de21d712e3d5))
* edit volume with new layout ([1561731](https://github.com/zextras/carbonio-admin-console-ui/commit/15617311c5d44385d45070c4555115dcffda6049))
* hide backup feature if listServer right not available ([3ef7c57](https://github.com/zextras/carbonio-admin-console-ui/commit/3ef7c574d7cffc124c28f8aa12d8f903a6d239f2))
* hide global config if deligated admin does not have rights ([45a9af3](https://github.com/zextras/carbonio-admin-console-ui/commit/45a9af3e48e36d000d0ad5c9d1c0596514d1dc84))
* hide server list if user do not have listserver right ([efc1657](https://github.com/zextras/carbonio-admin-console-ui/commit/efc1657dfcba3cd9731d340cd1412da397d02a1a))
* hide storage option from primarybar when listServer right not avaiable ([8cca2ce](https://github.com/zextras/carbonio-admin-console-ui/commit/8cca2cebaface45f226b85ffc85a31a0c0cf5869))
* minio bucket create functionality added ([932c879](https://github.com/zextras/carbonio-admin-console-ui/commit/932c87974b3eff37c87e4762e7e5551c1c982218))
* protocol config has been added to inbound and security mta ([2e798af](https://github.com/zextras/carbonio-admin-console-ui/commit/2e798af6bdd15da62ce7b0deb6c530013c640b2a))
* rejection configuration for inbound and security added ([9f5e59f](https://github.com/zextras/carbonio-admin-console-ui/commit/9f5e59f8de6bc529b7a9326d0add1638a78ef310))


### Bug Fixes

* add account contact information ([#385](https://github.com/zextras/carbonio-admin-console-ui/issues/385)) ([9961af3](https://github.com/zextras/carbonio-admin-console-ui/commit/9961af3e7c8d3609a4e25c8ec26b91567c98e159))
* added correct parameter for datasource ([ca3707c](https://github.com/zextras/carbonio-admin-console-ui/commit/ca3707ce7f61950d3d2c7662f57a36ad27eee826))
* added datasource update feature ([c6884d2](https://github.com/zextras/carbonio-admin-console-ui/commit/c6884d248646a751f55a2ec68346de5e3fa677b0))
* added frequency update todo selection for unit time ([8895bee](https://github.com/zextras/carbonio-admin-console-ui/commit/8895bee477ed2fb6d9ed5098650e1a22b7e2f573))
* added tooltip ([817ec2b](https://github.com/zextras/carbonio-admin-console-ui/commit/817ec2b2ce093ebce860c2c91883c63629e2b087))
* also changed in create account ([fde3dec](https://github.com/zextras/carbonio-admin-console-ui/commit/fde3decd27bb8fdf116d68aeb583858ce1cb0e62))
* backup module enable disable check added ([49cb917](https://github.com/zextras/carbonio-admin-console-ui/commit/49cb917a64b0da174303a4429e4b461a2e709b46))
* backup module not avaiable when module not license ([2afbac3](https://github.com/zextras/carbonio-admin-console-ui/commit/2afbac324d737fb5887b407f868cb5febf4085cc))
* cancel button not working on domain settings ([69c8eae](https://github.com/zextras/carbonio-admin-console-ui/commit/69c8eaecb35ac69022e83a10031f31b9db4d92b7))
* chevron icon issue ([#379](https://github.com/zextras/carbonio-admin-console-ui/issues/379)) ([a175d6d](https://github.com/zextras/carbonio-admin-console-ui/commit/a175d6d86aafb8b5239ad93207fa198f2ecca547))
* close account issue ([#324](https://github.com/zextras/carbonio-admin-console-ui/issues/324)) ([22d6021](https://github.com/zextras/carbonio-admin-console-ui/commit/22d6021b31b216bacafbf827fa904efdc3252074))
* commented interval parameter to avoid api error ([4e9517f](https://github.com/zextras/carbonio-admin-console-ui/commit/4e9517ff3732afa4a252511f7710ac0bf26101d8))
* comments resolved and types added ([97a6499](https://github.com/zextras/carbonio-admin-console-ui/commit/97a64998345a9ae67a73c1775fa38b230e26953a))
* conflicts resolved ([31e0c98](https://github.com/zextras/carbonio-admin-console-ui/commit/31e0c98a7d8053fc0e0b0729f58da4db1557db9b))
* conflicts resolved ([a508802](https://github.com/zextras/carbonio-admin-console-ui/commit/a50880256e55acc1e79f52d5882baa54be753654))
* domain select is not working ([1f8879f](https://github.com/zextras/carbonio-admin-console-ui/commit/1f8879f6d416f30382fb335189ad74a5c3b932ff))
* error message not show to user ([8bdbe91](https://github.com/zextras/carbonio-admin-console-ui/commit/8bdbe91d17acbfa75df92b32df8cfd657bc13264))
* feedback fixed about saving domain ([1c33c5a](https://github.com/zextras/carbonio-admin-console-ui/commit/1c33c5a865f7e32445a0ed48d98d750013bc5fd5))
* fixed cancel button issue ([13497e5](https://github.com/zextras/carbonio-admin-console-ui/commit/13497e53b3e0803d12fb3ae5890fd1ad703f9e0f))
* fixed default value state for measure unit ([979d263](https://github.com/zextras/carbonio-admin-console-ui/commit/979d2638b42b1625e1f954a59d54c2dc151b0e91))
* fixed dn update part todo settings pending ([4c47f6b](https://github.com/zextras/carbonio-admin-console-ui/commit/4c47f6b4d2d74caccff1f39880ee4361514c523e))
* fixed gal frequency snackbar ([648521b](https://github.com/zextras/carbonio-admin-console-ui/commit/648521b3591505c218c9cac79f0928ecdfddc5dc))
* fixed interval issue ([8287e28](https://github.com/zextras/carbonio-admin-console-ui/commit/8287e284b71f810bc8f4854dc8a35a3532bf0132))
* fixed new s3 edit volume ([12952da](https://github.com/zextras/carbonio-admin-console-ui/commit/12952da29917a6fa985f5ecff3c611b125e6a7ef))
* fixed prefix and path layout in listings ([dd04937](https://github.com/zextras/carbonio-admin-console-ui/commit/dd04937bd153cde6a9b6913773cabb8e77626917))
* fixed signature not not showing properly issue ([388bf52](https://github.com/zextras/carbonio-admin-console-ui/commit/388bf5226b0186a70dd176cb09f7a230833c6a4e))
* fixed translation issue ([223fea2](https://github.com/zextras/carbonio-admin-console-ui/commit/223fea254fe9c77980992c5ff5eb2cea091c5569))
* fixed translations and removed duplicates ([7e90454](https://github.com/zextras/carbonio-admin-console-ui/commit/7e904547b1b6bdb037887b7418f2e4d96786824f))
* fixed type defination ([a3941c2](https://github.com/zextras/carbonio-admin-console-ui/commit/a3941c2817961fc0f757dc406a9bb447315cab2c))
* gal drop down selection cut label ([25a9486](https://github.com/zextras/carbonio-admin-console-ui/commit/25a948671eb4e5c505a6aa26031c8f9795f1219e))
* general domain setting filed blinking ([b1e07a8](https://github.com/zextras/carbonio-admin-console-ui/commit/b1e07a871be170cbb75e69faa24a2a18daff0e5d))
* general settings info field as read only ([#382](https://github.com/zextras/carbonio-admin-console-ui/issues/382)) ([f243f66](https://github.com/zextras/carbonio-admin-console-ui/commit/f243f66ddc7975299f975c1b68eddcc4b3b8b774))
* hide resources from admin UI ([#359](https://github.com/zextras/carbonio-admin-console-ui/issues/359)) ([cb1caca](https://github.com/zextras/carbonio-admin-console-ui/commit/cb1cacabb74b46eee687f2384da0690009062c60))
* make volume name as readonly ([#380](https://github.com/zextras/carbonio-admin-console-ui/issues/380)) ([e41afe1](https://github.com/zextras/carbonio-admin-console-ui/commit/e41afe1e3775a74472a56a0677143709da3549bb))
* missing measurement for quota account in create domain ([39d19e8](https://github.com/zextras/carbonio-admin-console-ui/commit/39d19e808000b5e33f59127feaa90bd07af2c345))
* padding not show properly in mat inbound ui ([faacd05](https://github.com/zextras/carbonio-admin-console-ui/commit/faacd0580854f7738a4860b86e57bbbffa9e9bcf))
* re-checked and removed unused translations ([48f76a8](https://github.com/zextras/carbonio-admin-console-ui/commit/48f76a83e134e38ec4e829348b6dedd92f09f14a))
* rem value ([da53001](https://github.com/zextras/carbonio-admin-console-ui/commit/da530013712e8cf0d8782a2772410b7dd44fa545))
* remove bulk action button ([#381](https://github.com/zextras/carbonio-admin-console-ui/issues/381)) ([d581133](https://github.com/zextras/carbonio-admin-console-ui/commit/d58113313014f83e37ff34ea4c9c18ae6fd63edd))
* remove hardcode color from serverlist ([#312](https://github.com/zextras/carbonio-admin-console-ui/issues/312)) ([66381c8](https://github.com/zextras/carbonio-admin-console-ui/commit/66381c8eea46d6ed47f7e8a35c9e28bc9e95aca7))
* remove signature feature from resources ([#348](https://github.com/zextras/carbonio-admin-console-ui/issues/348)) ([0cbc1f3](https://github.com/zextras/carbonio-admin-console-ui/commit/0cbc1f3b733c990758c0aa381eb9533e40624ff8))
* removed both from gal ([#344](https://github.com/zextras/carbonio-admin-console-ui/issues/344)) ([105f9ae](https://github.com/zextras/carbonio-admin-console-ui/commit/105f9ae53b0a530dd569a9297b638771c9346f2e))
* removed dummy value conflicts resolved and added comment ([7dc925c](https://github.com/zextras/carbonio-admin-console-ui/commit/7dc925ce2c70e4d7f0a1c4952d23a0e593ff82d6))
* removed static value and added emptied string ([4e64fde](https://github.com/zextras/carbonio-admin-console-ui/commit/4e64fde133390222fd6bee71fe355dcd1dbe6ad2))
* removed target server for global config and added for serever selected config ([c549709](https://github.com/zextras/carbonio-admin-console-ui/commit/c54970915f7a23819d46cd1fca7ce95366fd7990))
* resolve conflict ([cc2e2c1](https://github.com/zextras/carbonio-admin-console-ui/commit/cc2e2c1da6b5afde87348793e2ac069bc26759e8))
* resolve conflict ([6eec228](https://github.com/zextras/carbonio-admin-console-ui/commit/6eec228b81ed05729bbe73a892ee91555ba3a2c7))
* resolve conflict ([aea2d52](https://github.com/zextras/carbonio-admin-console-ui/commit/aea2d52fe569fdf1de4c4d88d1f42b1fd51e6fe3))
* resovle conflict ([240fd77](https://github.com/zextras/carbonio-admin-console-ui/commit/240fd77806e384ef0870f325647cf6c30bb15902))
* restore account wizard validation check applied ([04cc730](https://github.com/zextras/carbonio-admin-console-ui/commit/04cc7309622932406ae4f720e278b47a36dfe177))
* scrolling on bucket list ([28922d7](https://github.com/zextras/carbonio-admin-console-ui/commit/28922d7e5a8c22fce67a40faa5bf3c374f3e2c56))
* should proper error message on backup initiaze ([86e283f](https://github.com/zextras/carbonio-admin-console-ui/commit/86e283fb086a9be19c9132716b0cd0eb4e02dd09))
* solve smell in code ([2f787cf](https://github.com/zextras/carbonio-admin-console-ui/commit/2f787cf79a8b7201dd326445f9d3d47fabfe5a22))
* sonar analysis bug ([13fa72c](https://github.com/zextras/carbonio-admin-console-ui/commit/13fa72c0d087175b71582d17c92346f5e3163e57))
* sonar bugs has been solved ([9025b2a](https://github.com/zextras/carbonio-admin-console-ui/commit/9025b2a4eb7d9009faa41d56d4def4fb91f225c9))
* sonar bugs issue has been fix ([a2af7c4](https://github.com/zextras/carbonio-admin-console-ui/commit/a2af7c468aed44c91f8898f4d29b9948952a0692))
* sonarqube bugs ([d3edb3b](https://github.com/zextras/carbonio-admin-console-ui/commit/d3edb3b4a90b2e59feedd766ef13a670817b57e0))
* table row does not select from empty column ([4d8def2](https://github.com/zextras/carbonio-admin-console-ui/commit/4d8def2e360738f8a43e365d344725a215304e8b))
* translation changed ([e7a79ad](https://github.com/zextras/carbonio-admin-console-ui/commit/e7a79ad505c9c04cad96c4e45839885668120505))

### [0.9.19](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.18...v0.9.19) (2023-05-12)

### [0.9.18](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.17...v0.9.18) (2023-05-08)

### [0.9.17](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.16...v0.9.17) (2023-04-27)


### Features

* added create destroy galsync account ([35e6c30](https://github.com/zextras/carbonio-admin-console-ui/commit/35e6c3050e6a1dbca84274dbaffa97e24ab70762))
* added feature to check and veriify auth h in active directory ([06e7bdc](https://github.com/zextras/carbonio-admin-console-ui/commit/06e7bdc32c4f9bb9824c3adde6c621efe2d46cf2))
* hide backup feature if listServer right not available ([3ef7c57](https://github.com/zextras/carbonio-admin-console-ui/commit/3ef7c574d7cffc124c28f8aa12d8f903a6d239f2))
* hide server list if user do not have listserver right ([efc1657](https://github.com/zextras/carbonio-admin-console-ui/commit/efc1657dfcba3cd9731d340cd1412da397d02a1a))
* hide storage option from primarybar when listServer right not avaiable ([8cca2ce](https://github.com/zextras/carbonio-admin-console-ui/commit/8cca2cebaface45f226b85ffc85a31a0c0cf5869))


### Bug Fixes

* also changed in create account ([fde3dec](https://github.com/zextras/carbonio-admin-console-ui/commit/fde3decd27bb8fdf116d68aeb583858ce1cb0e62))
* backup module enable disable check added ([49cb917](https://github.com/zextras/carbonio-admin-console-ui/commit/49cb917a64b0da174303a4429e4b461a2e709b46))
* backup module not avaiable when module not license ([2afbac3](https://github.com/zextras/carbonio-admin-console-ui/commit/2afbac324d737fb5887b407f868cb5febf4085cc))
* domain select is not working ([1f8879f](https://github.com/zextras/carbonio-admin-console-ui/commit/1f8879f6d416f30382fb335189ad74a5c3b932ff))
* fixed translation issue ([223fea2](https://github.com/zextras/carbonio-admin-console-ui/commit/223fea254fe9c77980992c5ff5eb2cea091c5569))
* fixed translations and removed duplicates ([7e90454](https://github.com/zextras/carbonio-admin-console-ui/commit/7e904547b1b6bdb037887b7418f2e4d96786824f))
* fixed type defination ([a3941c2](https://github.com/zextras/carbonio-admin-console-ui/commit/a3941c2817961fc0f757dc406a9bb447315cab2c))
* gal drop down selection cut label ([25a9486](https://github.com/zextras/carbonio-admin-console-ui/commit/25a948671eb4e5c505a6aa26031c8f9795f1219e))
* general domain setting filed blinking ([b1e07a8](https://github.com/zextras/carbonio-admin-console-ui/commit/b1e07a871be170cbb75e69faa24a2a18daff0e5d))
* re-checked and removed unused translations ([48f76a8](https://github.com/zextras/carbonio-admin-console-ui/commit/48f76a83e134e38ec4e829348b6dedd92f09f14a))
* rem value ([da53001](https://github.com/zextras/carbonio-admin-console-ui/commit/da530013712e8cf0d8782a2772410b7dd44fa545))
* remove signature feature from resources ([#348](https://github.com/zextras/carbonio-admin-console-ui/issues/348)) ([0cbc1f3](https://github.com/zextras/carbonio-admin-console-ui/commit/0cbc1f3b733c990758c0aa381eb9533e40624ff8))
* removed target server for global config and added for serever selected config ([c549709](https://github.com/zextras/carbonio-admin-console-ui/commit/c54970915f7a23819d46cd1fca7ce95366fd7990))
* restore account wizard validation check applied ([04cc730](https://github.com/zextras/carbonio-admin-console-ui/commit/04cc7309622932406ae4f720e278b47a36dfe177))

### [0.9.16](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.15...v0.9.16) (2023-04-14)


### Bug Fixes

* removed both from gal ([#344](https://github.com/zextras/carbonio-admin-console-ui/issues/344)) ([105f9ae](https://github.com/zextras/carbonio-admin-console-ui/commit/105f9ae53b0a530dd569a9297b638771c9346f2e))

### [0.9.15](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.14...v0.9.15) (2023-04-12)


### Bug Fixes

* close account issue ([#324](https://github.com/zextras/carbonio-admin-console-ui/issues/324)) ([22d6021](https://github.com/zextras/carbonio-admin-console-ui/commit/22d6021b31b216bacafbf827fa904efdc3252074))

### [0.9.14](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.13...v0.9.14) (2023-03-30)


### Features

* add primary color configuration ([#301](https://github.com/zextras/carbonio-admin-console-ui/issues/301)) ([e663d4b](https://github.com/zextras/carbonio-admin-console-ui/commit/e663d4b4d8a31c835035efdb76745034d4f9258e))
* added dn settings ([458f25c](https://github.com/zextras/carbonio-admin-console-ui/commit/458f25c1e74aa8e02b640f8e9122e47733071b3f))
* added feature for external gal ldpa url ([5eaaad8](https://github.com/zextras/carbonio-admin-console-ui/commit/5eaaad8a2cd8b85bc269bff2f646361039b0a8e5))
* edit volume with new layout ([1561731](https://github.com/zextras/carbonio-admin-console-ui/commit/15617311c5d44385d45070c4555115dcffda6049))
* minio bucket create functionality added ([932c879](https://github.com/zextras/carbonio-admin-console-ui/commit/932c87974b3eff37c87e4762e7e5551c1c982218))


### Bug Fixes

* added correct parameter for datasource ([ca3707c](https://github.com/zextras/carbonio-admin-console-ui/commit/ca3707ce7f61950d3d2c7662f57a36ad27eee826))
* added datasource update feature ([c6884d2](https://github.com/zextras/carbonio-admin-console-ui/commit/c6884d248646a751f55a2ec68346de5e3fa677b0))
* added frequency update todo selection for unit time ([8895bee](https://github.com/zextras/carbonio-admin-console-ui/commit/8895bee477ed2fb6d9ed5098650e1a22b7e2f573))
* added tooltip ([817ec2b](https://github.com/zextras/carbonio-admin-console-ui/commit/817ec2b2ce093ebce860c2c91883c63629e2b087))
* cancel button not working on domain settings ([69c8eae](https://github.com/zextras/carbonio-admin-console-ui/commit/69c8eaecb35ac69022e83a10031f31b9db4d92b7))
* commented interval parameter to avoid api error ([4e9517f](https://github.com/zextras/carbonio-admin-console-ui/commit/4e9517ff3732afa4a252511f7710ac0bf26101d8))
* comments resolved and types added ([97a6499](https://github.com/zextras/carbonio-admin-console-ui/commit/97a64998345a9ae67a73c1775fa38b230e26953a))
* conflicts resolved ([31e0c98](https://github.com/zextras/carbonio-admin-console-ui/commit/31e0c98a7d8053fc0e0b0729f58da4db1557db9b))
* conflicts resolved ([a508802](https://github.com/zextras/carbonio-admin-console-ui/commit/a50880256e55acc1e79f52d5882baa54be753654))
* feedback fixed about saving domain ([1c33c5a](https://github.com/zextras/carbonio-admin-console-ui/commit/1c33c5a865f7e32445a0ed48d98d750013bc5fd5))
* fixed cancel button issue ([13497e5](https://github.com/zextras/carbonio-admin-console-ui/commit/13497e53b3e0803d12fb3ae5890fd1ad703f9e0f))
* fixed default value state for measure unit ([979d263](https://github.com/zextras/carbonio-admin-console-ui/commit/979d2638b42b1625e1f954a59d54c2dc151b0e91))
* fixed dn update part todo settings pending ([4c47f6b](https://github.com/zextras/carbonio-admin-console-ui/commit/4c47f6b4d2d74caccff1f39880ee4361514c523e))
* fixed gal frequency snackbar ([648521b](https://github.com/zextras/carbonio-admin-console-ui/commit/648521b3591505c218c9cac79f0928ecdfddc5dc))
* fixed interval issue ([8287e28](https://github.com/zextras/carbonio-admin-console-ui/commit/8287e284b71f810bc8f4854dc8a35a3532bf0132))
* fixed new s3 edit volume ([12952da](https://github.com/zextras/carbonio-admin-console-ui/commit/12952da29917a6fa985f5ecff3c611b125e6a7ef))
* fixed prefix and path layout in listings ([dd04937](https://github.com/zextras/carbonio-admin-console-ui/commit/dd04937bd153cde6a9b6913773cabb8e77626917))
* missing measurement for quota account in create domain ([39d19e8](https://github.com/zextras/carbonio-admin-console-ui/commit/39d19e808000b5e33f59127feaa90bd07af2c345))
* remove hardcode color from serverlist ([#312](https://github.com/zextras/carbonio-admin-console-ui/issues/312)) ([66381c8](https://github.com/zextras/carbonio-admin-console-ui/commit/66381c8eea46d6ed47f7e8a35c9e28bc9e95aca7))
* removed dummy value conflicts resolved and added comment ([7dc925c](https://github.com/zextras/carbonio-admin-console-ui/commit/7dc925ce2c70e4d7f0a1c4952d23a0e593ff82d6))
* scrolling on bucket list ([28922d7](https://github.com/zextras/carbonio-admin-console-ui/commit/28922d7e5a8c22fce67a40faa5bf3c374f3e2c56))
* translation changed ([e7a79ad](https://github.com/zextras/carbonio-admin-console-ui/commit/e7a79ad505c9c04cad96c4e45839885668120505))

### [0.9.13](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.12...v0.9.13) (2023-03-14)

### [0.9.12](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.11...v0.9.12) (2023-03-02)


### Features

* download mailbox quota in csv ([1ada4f3](https://github.com/zextras/carbonio-admin-console-ui/commit/1ada4f3510626b2fceeb7a4ac33278d02e4bcbfc))
* sort functionality added inside mail quota ([a52e26e](https://github.com/zextras/carbonio-admin-console-ui/commit/a52e26eae8df47794e9066ac77f4180326e06a9f))


### Bug Fixes

* add the hand pointer to clickable items in the secondary bar ([#279](https://github.com/zextras/carbonio-admin-console-ui/issues/279)) ([eb2be76](https://github.com/zextras/carbonio-admin-console-ui/commit/eb2be76f2e47230c3087ecfb809c727c4d304f9e))
* cos feature error ([#291](https://github.com/zextras/carbonio-admin-console-ui/issues/291)) ([f515607](https://github.com/zextras/carbonio-admin-console-ui/commit/f51560774b896dd9ad959695646e96fa58846a3d))
* delete account dialog trans ([#286](https://github.com/zextras/carbonio-admin-console-ui/issues/286)) ([b13b8e6](https://github.com/zextras/carbonio-admin-console-ui/commit/b13b8e6c8d22be6884e2408e525e8e5efce6bb53))
* disable download button when load record of mailbox quota ([a423c3b](https://github.com/zextras/carbonio-admin-console-ui/commit/a423c3b83c8daead691a4ef922652c18155348f6))
* height of table header in bucket detail is worng ([20ee133](https://github.com/zextras/carbonio-admin-console-ui/commit/20ee13323d80830161bcee8605228eac0cdc81ce))
* notification and operation should show in carbonio Advance ([d7c57fb](https://github.com/zextras/carbonio-admin-console-ui/commit/d7c57fbcb81080b45fc809b3ba9bb0eb71ffd3dd))
* tab bar upgrade after design system upgrade ([fd6fda1](https://github.com/zextras/carbonio-admin-console-ui/commit/fd6fda104d78368f6607362e0fc6a04f31d4d260))

### [0.9.11](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.10...v0.9.11) (2023-02-21)

### [0.9.10](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.9...v0.9.10) (2023-02-16)

### [0.9.9](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.8...v0.9.9) (2023-02-15)


### Bug Fixes

* local volume create getting error ([ca92f6f](https://github.com/zextras/carbonio-admin-console-ui/commit/ca92f6ff3b2cf9c71ab2a1013c75a7e16de7d187))
* notification and operation should show in carbonio Advance ([8788df1](https://github.com/zextras/carbonio-admin-console-ui/commit/8788df162882b0f412b3909a370f067ec69a2bd7))

### [0.9.8](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.7...v0.9.8) (2023-02-02)


### Features

* added create advanced volume request api ([bd65d73](https://github.com/zextras/carbonio-admin-console-ui/commit/bd65d73fb97590575424ca882bbeae4de15671c2))
* added separation of running and queued ([2890370](https://github.com/zextras/carbonio-admin-console-ui/commit/2890370e14471a798294a988b67ff3e2c39af02d))
* extarnal volume ui added and api calls also ([1e4d1bb](https://github.com/zextras/carbonio-admin-console-ui/commit/1e4d1bbcc0c5369696d142926198c2c44a2cc3b1))


### Bug Fixes

* account lockout status ([#246](https://github.com/zextras/carbonio-admin-console-ui/issues/246)) ([5a0463d](https://github.com/zextras/carbonio-admin-console-ui/commit/5a0463d2460624686a4e289dbaff24b1d172e004))
* account password issue and remove language, timezone ([#247](https://github.com/zextras/carbonio-admin-console-ui/issues/247)) ([a9182d6](https://github.com/zextras/carbonio-admin-console-ui/commit/a9182d61d8ce1dcc6bf28db9ad9e897859bd3e84))
* added copied operation with list we have ([d2af2bb](https://github.com/zextras/carbonio-admin-console-ui/commit/d2af2bb852864aed0c28e1935bf21be4c6dcd427))
* adjust server list based on carbonio ce/advance ([ab92a89](https://github.com/zextras/carbonio-admin-console-ui/commit/ab92a89a42fdc7855588de1ca376e9dc4de7d560))
* after account selection session panel does not reload ([1e8cb32](https://github.com/zextras/carbonio-admin-console-ui/commit/1e8cb32c87dd3faef41b9845097961ee7c7c04b2))
* conflicts resolved ([3111c2e](https://github.com/zextras/carbonio-admin-console-ui/commit/3111c2e6282bb35d87bf6a8ce7275cb9df017673))
* create volume with external ([c0c3962](https://github.com/zextras/carbonio-admin-console-ui/commit/c0c39627146fbc87656fe81978a8bedd2065f4e4))
* dashboard should not report the product name ([#257](https://github.com/zextras/carbonio-admin-console-ui/issues/257)) ([a60d3ba](https://github.com/zextras/carbonio-admin-console-ui/commit/a60d3ba519c21221fe82e42bb700e2b4361d6ca6))
* domain selector blank case not showing default list of domain ([#251](https://github.com/zextras/carbonio-admin-console-ui/issues/251)) ([6232b7d](https://github.com/zextras/carbonio-admin-console-ui/commit/6232b7d482f84ce73af1c5b07bf6f857ec273207))
* fixed  operation details panel ([54b075f](https://github.com/zextras/carbonio-admin-console-ui/commit/54b075fba884019f542a0ba1e00e2827489d881c))
* fixed dynamic api call ([90780c7](https://github.com/zextras/carbonio-admin-console-ui/commit/90780c7418f22a821546aa71a9f4403d804f2749))
* fixed issue for set current and primary api call ([64c2acd](https://github.com/zextras/carbonio-admin-console-ui/commit/64c2acd922da97b3067a31523933caa3d058d463))
* fixed px and rem issue ([4d749ca](https://github.com/zextras/carbonio-admin-console-ui/commit/4d749ca6585b672991672abace813948f6685459))
* fixed set current volume request issue ([fd19ea8](https://github.com/zextras/carbonio-admin-console-ui/commit/fd19ea8a799646adee181a98888761d5dbba2eba))
* iscurrent on create ([dee8d96](https://github.com/zextras/carbonio-admin-console-ui/commit/dee8d96c9805037aa99453c1004dd78fbd661237))
* layout issue with px to rem ([38d3e7e](https://github.com/zextras/carbonio-admin-console-ui/commit/38d3e7e1e32652a0a60547fdbcad363cccd101ac))
* mail store list not display in create domain ([faffe49](https://github.com/zextras/carbonio-admin-console-ui/commit/faffe4974d85cff5d5f568fac35b90f5d5c8d226))
* manage user locale from cos pref ([#239](https://github.com/zextras/carbonio-admin-console-ui/issues/239)) ([886681f](https://github.com/zextras/carbonio-admin-console-ui/commit/886681f7ce2b77e2993242052b634f8a1efbfdd2))
* optimize list data with color and weight ([1f5bef7](https://github.com/zextras/carbonio-admin-console-ui/commit/1f5bef732737183745b7aa0cb77183d9620c7960))
* remove eye icon from edit resource panel ([#250](https://github.com/zextras/carbonio-admin-console-ui/issues/250)) ([b9b7071](https://github.com/zextras/carbonio-admin-console-ui/commit/b9b7071c44aef6b2b2191bbe5df7545e84809063))
* removed commented code ([6a8cc0a](https://github.com/zextras/carbonio-admin-console-ui/commit/6a8cc0a1345b4087694031745d85b00623e69b70))
* removed unwanted fields ([fa1b4d9](https://github.com/zextras/carbonio-admin-console-ui/commit/fa1b4d9a45197f0a444b85d7d70a8691591974a0))
* search server bucket panel not working ([704735c](https://github.com/zextras/carbonio-admin-console-ui/commit/704735c78dd84ec4927908aa792730a85586bd4e))
* server list does not show value incase of multiserver ([086209c](https://github.com/zextras/carbonio-admin-console-ui/commit/086209ceb8529f35652dd5995665e1c47a41d5f4))
* server list not searchable from backup and mailstore ([68ddcdc](https://github.com/zextras/carbonio-admin-console-ui/commit/68ddcdc6a79eb6ae3e10b862bc344ed95ae31dfc))
* storetype missin issue ([9ec1918](https://github.com/zextras/carbonio-admin-console-ui/commit/9ec191888fcafeed4deb23d0863dc66e025f3215))
* user session not remove when change account from list ([a017433](https://github.com/zextras/carbonio-admin-console-ui/commit/a0174336656c1acae056f453790eba2bc144bcfe))

### [0.9.7](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.6...v0.9.7) (2023-01-16)

### [0.9.6](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.5...v0.9.6) (2023-01-05)


### Features

* add copyrights information configuration in theme ([#216](https://github.com/zextras/carbonio-admin-console-ui/issues/216)) ([8ec7f3c](https://github.com/zextras/carbonio-admin-console-ui/commit/8ec7f3c2464eaac575c476f9f57591f9f25a24f1))
* added download pdf feature ([a4a4a58](https://github.com/zextras/carbonio-admin-console-ui/commit/a4a4a58461026bb0ab1a9f023c17d4e5b85f5d15))
* added tooltip of notes and label column ([25d8dbc](https://github.com/zextras/carbonio-admin-console-ui/commit/25d8dbc0d9eabfddce3fbcb552e36713849f14b2))
* certificate verification done ([2d9bdc3](https://github.com/zextras/carbonio-admin-console-ui/commit/2d9bdc36c60c8d8c7c09afccd8b2e5a21cfd0ce0))
* end session of user functionality implement ([5ada025](https://github.com/zextras/carbonio-admin-console-ui/commit/5ada025c8cfdb46c6f8bee28c0aa580cab2f98ed))
* notification detail dialog added ([b57e691](https://github.com/zextras/carbonio-admin-console-ui/commit/b57e6914421dc2135272832da0f4c00effc8445d))
* notification include inside dashboard ([1d81698](https://github.com/zextras/carbonio-admin-console-ui/commit/1d816982499ede6b7f4a08ef86f7a2041da6608a))
* notification operation in primary bar added ([7fe4d36](https://github.com/zextras/carbonio-admin-console-ui/commit/7fe4d36b70b2b137c70ca3b7cee3b2ac56ea9085))
* refactored layout and added bucket filter ([fa1a0f4](https://github.com/zextras/carbonio-admin-console-ui/commit/fa1a0f4461950613c47169e6b901c3c3d6489e8b))
* refactored the upload and get certificate feature ([1f8baf1](https://github.com/zextras/carbonio-admin-console-ui/commit/1f8baf1a8ad8409fe720d21c909cae77752a9469))
* server list added in dashboard ([6a3bcb5](https://github.com/zextras/carbonio-admin-console-ui/commit/6a3bcb53894fa09c66968120c46d8b757d74be41))


### Bug Fixes

* active sync search open detail device ([5170b3a](https://github.com/zextras/carbonio-admin-console-ui/commit/5170b3a827b6cbc5d3065effddd3a739840f8bca))
* added mailbox servers function ([1dc268b](https://github.com/zextras/carbonio-admin-console-ui/commit/1dc268bc500d374f006665d71b5319b18e5d3a5c))
* adding email address to mailing list not working ([fde5f2e](https://github.com/zextras/carbonio-admin-console-ui/commit/fde5f2ec4048163d44d5a1968e5d8bfa045bc26e))
* applied suggestions ([5c6207b](https://github.com/zextras/carbonio-admin-console-ui/commit/5c6207bc19a9bea81a1ac18f0b99471a72df9ff5))
* conflicts resolved ([da6baea](https://github.com/zextras/carbonio-admin-console-ui/commit/da6baea6f2eac96fc337bae17a474f8ad68f5f25))
* conflicts resolved ([c9b8663](https://github.com/zextras/carbonio-admin-console-ui/commit/c9b86639abc3cebe3ab468ad5f809a0b69fa7d16))
* conflicts resolved ([faddbce](https://github.com/zextras/carbonio-admin-console-ui/commit/faddbcec7d268bb37e211fef8866caa72b96e787))
* console output temporary ([e6d2035](https://github.com/zextras/carbonio-admin-console-ui/commit/e6d20355e83fff78221fb6ff8c8f5f8cfa1dfee8))
* disabled list item is enabled in dark mode issue ([#222](https://github.com/zextras/carbonio-admin-console-ui/issues/222)) ([76a41ac](https://github.com/zextras/carbonio-admin-console-ui/commit/76a41acbb8b0ba01d8c6d855d3761d958f41af4c))
* domain selector issue ([#209](https://github.com/zextras/carbonio-admin-console-ui/issues/209)) ([ea9b323](https://github.com/zextras/carbonio-admin-console-ui/commit/ea9b32324dee6a2e46fbad7b3b63cc51cde4f65b))
* filter for label also added ([4482d95](https://github.com/zextras/carbonio-admin-console-ui/commit/4482d959e4ce3e7b3177b58893a9637fa87ee324))
* fixed domain deleted typo ([f4d9914](https://github.com/zextras/carbonio-admin-console-ui/commit/f4d9914a1301eb1dc50eca2d889a727468f5527b))
* fixed upload certificate with modify domain request ([97c6b9a](https://github.com/zextras/carbonio-admin-console-ui/commit/97c6b9abbdd61015c52fb8c866449fbc43be2baf))
* if no data in store type ([5b4daf7](https://github.com/zextras/carbonio-admin-console-ui/commit/5b4daf7d7ee94a50def8d688b480bd5c49f24f5e))
* made prefix optional and removed ([c07c97f](https://github.com/zextras/carbonio-admin-console-ui/commit/c07c97fe2066c75b4ce6b17bd6e2b75426810326))
* mailboxquota paging not working ([1c12b56](https://github.com/zextras/carbonio-admin-console-ui/commit/1c12b568ceea26ca4cee13b6d18f1f472ada3de3))
* prefix and store type removed on edit ([71484c4](https://github.com/zextras/carbonio-admin-console-ui/commit/71484c4a8ef1491acee857e494d95b7c9dd3742d))
* read only prefix and type shown in edit bucket ([5efcece](https://github.com/zextras/carbonio-admin-console-ui/commit/5efcece1bbb8260c5cc46a5c5e75bb80554f773e))
* remove cos proxy allowed domain ([#229](https://github.com/zextras/carbonio-admin-console-ui/issues/229)) ([31785fd](https://github.com/zextras/carbonio-admin-console-ui/commit/31785fd8a48ffd21060f9e86885b634e16ed2ac7))
* snackbar error message while create domain ([#218](https://github.com/zextras/carbonio-admin-console-ui/issues/218)) ([0986b0b](https://github.com/zextras/carbonio-admin-console-ui/commit/0986b0bf97f2998dc601781eae66473cf438d5fc))
* table header translation ([49ef461](https://github.com/zextras/carbonio-admin-console-ui/commit/49ef461771607478ebdb4d9c3cf548fa7a622ce2))
* wizard footer removed and added custom button ([b0833e6](https://github.com/zextras/carbonio-admin-console-ui/commit/b0833e6f07eddc54f62cb74152187b2797587521))

### [0.9.5](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.4...v0.9.5) (2022-11-25)


### Features

* added active sync design ([34d284f](https://github.com/zextras/carbonio-admin-console-ui/commit/34d284fd4725b491c4ca5837d035164a66e2b540))
* added extra confirmation if dl delete has share grants ([1f40ef9](https://github.com/zextras/carbonio-admin-console-ui/commit/1f40ef9cb9b2d21addf7dd7dbaeabc23a2e63bcc))
* device operation confirmation dialog added ([3734092](https://github.com/zextras/carbonio-admin-console-ui/commit/373409281ff15977f54d0cf7c288948b518baea3))
* manage external volume functionality ([c53b235](https://github.com/zextras/carbonio-admin-console-ui/commit/c53b235a4fdb4fa8dcb980f659976139322c5622))
* reset/suspend/wipe device soap added ([3d64b44](https://github.com/zextras/carbonio-admin-console-ui/commit/3d64b44b54a6d3db3d259f2719c4aae0780fa448))
* search on active sync device added ([e8397d8](https://github.com/zextras/carbonio-admin-console-ui/commit/e8397d8c95de6566e6f489984e433c677d6d0923))


### Bug Fixes

* able to modify active sync access ([#181](https://github.com/zextras/carbonio-admin-console-ui/issues/181)) ([3f8e585](https://github.com/zextras/carbonio-admin-console-ui/commit/3f8e5852704f0ad5a471683d2b3e28ea392e0d76))
* changed from grant to grantee rights count show ([bd90aa2](https://github.com/zextras/carbonio-admin-console-ui/commit/bd90aa2e5923777b28ed188469af4264a4842cd4))
* conflicts resolved ([d9b1e1b](https://github.com/zextras/carbonio-admin-console-ui/commit/d9b1e1b3417d79d5af9e15ab64568fd3b73bea5d))
* cos design issue ([#198](https://github.com/zextras/carbonio-admin-console-ui/issues/198)) ([5bd9dfb](https://github.com/zextras/carbonio-admin-console-ui/commit/5bd9dfbb2dc02abfe80b519d4f40028c7b34fbfd))
* custom bucket typo issue ([#183](https://github.com/zextras/carbonio-admin-console-ui/issues/183)) ([f67abc2](https://github.com/zextras/carbonio-admin-console-ui/commit/f67abc2d8c070a36b27cf444232b6d039cc82316))
* delete account date does not display ([1ba7545](https://github.com/zextras/carbonio-admin-console-ui/commit/1ba75457f2756002619b9f4228e3a1553ac08b7b))
* grantee and target sum added ([babdc4e](https://github.com/zextras/carbonio-admin-console-ui/commit/babdc4e3ce3567494835500b90fea999baa2b7f3))
* improved is current delete modal text ([#193](https://github.com/zextras/carbonio-admin-console-ui/issues/193)) ([cd6d034](https://github.com/zextras/carbonio-admin-console-ui/commit/cd6d0342414408386bba5d06c72c29697029195a))
* mailing list show option twice ([a2cfbe8](https://github.com/zextras/carbonio-admin-console-ui/commit/a2cfbe8ad2eb7e54de412376cd84db58944ff126))
* remove advance check and get from admin shell ui ([#188](https://github.com/zextras/carbonio-admin-console-ui/issues/188)) ([9985cb9](https://github.com/zextras/carbonio-admin-console-ui/commit/9985cb9e33e82dfa9a8e1167a1f91c96d59d93a9))
* removed console log ([033b491](https://github.com/zextras/carbonio-admin-console-ui/commit/033b491d7da5c7e25d1fce02e9b6a5c098b91077))
* resolved conflicts ([e926ce3](https://github.com/zextras/carbonio-admin-console-ui/commit/e926ce3b128cdc00def33bbf080fddebc709eb03))
* send invite autocomplete list ([#197](https://github.com/zextras/carbonio-admin-console-ui/issues/197)) ([5b4ee84](https://github.com/zextras/carbonio-admin-console-ui/commit/5b4ee84e53b9309cf48d0015bae56d14fa16807c))
* typo html tag ([#205](https://github.com/zextras/carbonio-admin-console-ui/issues/205)) ([b413dcf](https://github.com/zextras/carbonio-admin-console-ui/commit/b413dcf3d44f5f4dd3d8b7224707fd8e0d4eb46f))
* update value for backup threashold ([d10b2a7](https://github.com/zextras/carbonio-admin-console-ui/commit/d10b2a79d1d01b21d273747cabe7079f711763fa))

### [0.9.4](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.3...v0.9.4) (2022-10-28)


### Features

* add flag if auth is advanced or not ([3def81f](https://github.com/zextras/carbonio-admin-console-ui/commit/3def81f5e2b3fbb92dbcbcba71fa51291841e602))
* added columns for advaned listing in mailstore ([f02dafa](https://github.com/zextras/carbonio-admin-console-ui/commit/f02dafad1546376e4b5375cd2284fe11a5c87e10))
* added diff wizard toggle for local and external volume ([d4f84bc](https://github.com/zextras/carbonio-admin-console-ui/commit/d4f84bc786c4334a22bf5d87b8f879ca34cb6c84))
* added empty state placeholders in buckets list ([332b7e0](https://github.com/zextras/carbonio-admin-console-ui/commit/332b7e036fa3d4a6415e87700920bd76d6843f80))
* added matomo tracking and event also ([17e2ceb](https://github.com/zextras/carbonio-admin-console-ui/commit/17e2cebafb378a5b56eab392cfb520f0df7feb1a))
* create hsm policy tab design added ([aef31ed](https://github.com/zextras/carbonio-admin-console-ui/commit/aef31ed6d2dbe215615f4b3116a8a4a9959315cd))
* delete hsm policy has been added ([aa2f5af](https://github.com/zextras/carbonio-admin-console-ui/commit/aa2f5af7820b884fca944387d4abe0323273a980))
* design added for edit hsm policy ([a15927c](https://github.com/zextras/carbonio-admin-console-ui/commit/a15927cf60696c93e6e25b26606bde56dd43d6c1))
* hsm setting functionality added ([9b3889e](https://github.com/zextras/carbonio-admin-console-ui/commit/9b3889e5c9b444a595424ed3fbab188037ec7591))


### Bug Fixes

* added condition based analytics tracking and optimized tracking code ([88a1a3a](https://github.com/zextras/carbonio-admin-console-ui/commit/88a1a3add103380aa715727ed55e10c87f4f0494))
* added fix to wizard for ce local external dropdown ([6bc318d](https://github.com/zextras/carbonio-admin-console-ui/commit/6bc318d3635d5e6831728479128a11ce80a6f873))
* conflicts resolved ([ea385c0](https://github.com/zextras/carbonio-admin-console-ui/commit/ea385c02f00efc5e362a903393a02f923a1f2764))
* fixed conflicts and minor wizard flow ([71166b9](https://github.com/zextras/carbonio-admin-console-ui/commit/71166b964cf7a1323ba0917bd424aad126235fc2))
* fixed proxy translation ([fe05226](https://github.com/zextras/carbonio-admin-console-ui/commit/fe0522605c12b84b420a46320aeced04099b22a8))
* fixed translation again for primary ([2aab7a0](https://github.com/zextras/carbonio-admin-console-ui/commit/2aab7a0b606787d9923a15f98dc1f67570866fa5))
* fixed translation issue ([0d0e47c](https://github.com/zextras/carbonio-admin-console-ui/commit/0d0e47c3acba46cd9c80dca1386f41e7e0727a76))
* managed new line with height and width css ([4014f12](https://github.com/zextras/carbonio-admin-console-ui/commit/4014f121601850fa8070b524fd59822ca0514eba))
* resolved comments of other developers ([a2d2676](https://github.com/zextras/carbonio-admin-console-ui/commit/a2d267651f3e62bdd600845a8d5619c7f4c21d01))
* reverted and commited new code ([9391574](https://github.com/zextras/carbonio-admin-console-ui/commit/93915748343ce2b9d12af1e4e63d8ed965c89255))
* subscription other features should be open by default ([d488029](https://github.com/zextras/carbonio-admin-console-ui/commit/d488029d7be6182adad9a1d3c9c855004090b99a))
* translation confirmed sproxy ([45084cc](https://github.com/zextras/carbonio-admin-console-ui/commit/45084cc025dfbaf1c10254411320231d972e1cf7))
* volume type selection issue ([ecc6846](https://github.com/zextras/carbonio-admin-console-ui/commit/ecc684688bfaf43df827a28f8159f98ee08b86af))

### [0.9.3](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.2...v0.9.3) (2022-10-06)


### Bug Fixes

* backup and cos tooltip ([0e4b8d0](https://github.com/zextras/carbonio-admin-console-ui/commit/0e4b8d0acae195579274fdffad8054abfe065c94))
* backup routing issue ([fac4885](https://github.com/zextras/carbonio-admin-console-ui/commit/fac4885d3897778758fde05aef95a47477db5450))
* disable all the items in Account features panel ([a21c678](https://github.com/zextras/carbonio-admin-console-ui/commit/a21c678e875f8319886e08a0ae1cb603f4e3f167))
* disable all the items in COS features panel ([e9ec9af](https://github.com/zextras/carbonio-admin-console-ui/commit/e9ec9af840e16bfa085dd93c946110a2398fa97c))
* disbale close button in case account is already closed ([7cf1938](https://github.com/zextras/carbonio-admin-console-ui/commit/7cf19383fba678d41c2d1de0281e515a842c35be))
* fix tooltip on DOMAIN icon according to real menu ([d43b58e](https://github.com/zextras/carbonio-admin-console-ui/commit/d43b58ebdb59de14d7ca1ec77f5628571c14f1f2))
* mailstores panel and breadcrums ([dd30b12](https://github.com/zextras/carbonio-admin-console-ui/commit/dd30b120525b53fde35b0c813efad990245b3a98))
* translation string ([edfcbaf](https://github.com/zextras/carbonio-admin-console-ui/commit/edfcbaf5dc1755a357804c51f6065a41cb3f0008))
* translation string ([f049ccc](https://github.com/zextras/carbonio-admin-console-ui/commit/f049ccc26dbe6770d95ef1b581f7ea3332e85ecb))

### [0.9.2](https://github.com/zextras/carbonio-admin-console-ui/compare/v0.9.1...v0.9.2) (2022-09-29)


### Features

* design added for configuration and advanced ([02f60bb](https://github.com/zextras/carbonio-admin-console-ui/commit/02f60bb2ef0f368a7a3735f7b37b504e597bae45))


### Bug Fixes

* resolve conflict ([ea052e5](https://github.com/zextras/carbonio-admin-console-ui/commit/ea052e589eae4fb049cd88ce01c803102ad183ca))
* translation and typo issues ([#155](https://github.com/zextras/carbonio-admin-console-ui/issues/155)) ([0d61a20](https://github.com/zextras/carbonio-admin-console-ui/commit/0d61a20c9394dbd5815d9816ec3e6f95366cf38b))
* typo issues ([#153](https://github.com/zextras/carbonio-admin-console-ui/issues/153)) ([2259155](https://github.com/zextras/carbonio-admin-console-ui/commit/225915570c7ce38ddb8336103b85081c2ddc9afd))

### 0.9.1 (2022-09-22)


### Features

* added fixes to layout and double click ([141efa6](https://github.com/zextras/carbonio-admin-console-ui/commit/141efa61659ce50f8137c35745304ddba4e36486))
* added matomo tracking to secondary sidebar ([b14c7ce](https://github.com/zextras/carbonio-admin-console-ui/commit/b14c7ce6b603ebd36d7c6c29be22d8455d3df6ed))
* added server lists with new ui ([c52f7ed](https://github.com/zextras/carbonio-admin-console-ui/commit/c52f7edaa23c4d06f8343dfe352c78f44563ef05))
* added update option with new layout ([c6eb595](https://github.com/zextras/carbonio-admin-console-ui/commit/c6eb595b27804a80783461fbe5ad57a9e32015e6))
* added volumes list based on selected server ui ([38ab0d9](https://github.com/zextras/carbonio-admin-console-ui/commit/38ab0d9ebc423947c6a24166d0ee8bbc6226b2f4))
* close account facility added in delete account ([01f2c66](https://github.com/zextras/carbonio-admin-console-ui/commit/01f2c66bef9ebfd652b43d299aac7a4c63f3777c))
* cos serverpool functionality added ([6389f69](https://github.com/zextras/carbonio-admin-console-ui/commit/6389f6940656c92566035a6920e7d3db4f8aad3b))
* create new ML wizard design basic added ([e25859a](https://github.com/zextras/carbonio-admin-console-ui/commit/e25859a60a75224136402f31e71216d97fd428df))
* create privacy page settings ([a68d47c](https://github.com/zextras/carbonio-admin-console-ui/commit/a68d47c4deb28bd977c530fd6c33a4a3d7d5b0d2))
* create volume ui api done ([bb07957](https://github.com/zextras/carbonio-admin-console-ui/commit/bb07957b3f2b901a212a11ff9f9bc9668ecb5a01))
* delete account feature added ([5a24bc5](https://github.com/zextras/carbonio-admin-console-ui/commit/5a24bc5e4ba3a248652d49a88f221b28fd057b91))
* edit volume api integrated ([a7dfd03](https://github.com/zextras/carbonio-admin-console-ui/commit/a7dfd03e8f86434c5a73621d79289d8db31b22fa))
* first commit ([a29441f](https://github.com/zextras/carbonio-admin-console-ui/commit/a29441f6c3e57a1fc952a1dc2481fd3d3a7c16e3))
* mailing detail functionality added ([1349454](https://github.com/zextras/carbonio-admin-console-ui/commit/134945497ef1e5f648f498984c97ca146c56a22c))
* managed other bucket types and added prefix validation ([1867b11](https://github.com/zextras/carbonio-admin-console-ui/commit/1867b114f6a008ab4f931e3eaaf0953e90cbb78e))
* memberurl and standard/dynamic header added in mailinglist edit ([8449763](https://github.com/zextras/carbonio-admin-console-ui/commit/8449763fbe1ee243ef85146cd426e89bc7c6fc9d))
* restore account basic design added ([76709e1](https://github.com/zextras/carbonio-admin-console-ui/commit/76709e12f8b62e43f55b9852e64583666021fc98))
* sidebar and manage template added ([b4323ec](https://github.com/zextras/carbonio-admin-console-ui/commit/b4323eca8a7ba46b57cecb18eb9c6632eec379ca))
* subscription section ui ([4a6a72a](https://github.com/zextras/carbonio-admin-console-ui/commit/4a6a72ae36bc7c4342ac40f6e4c3bf45dbf66bb8))
* ui added for volumes list and details ([795f335](https://github.com/zextras/carbonio-admin-console-ui/commit/795f3359742c0269aa36b29aaba7429903acf070))


### Bug Fixes

* account list not render in multiserver environment ([4c8a6fe](https://github.com/zextras/carbonio-admin-console-ui/commit/4c8a6fe315cb124d078449294a3980223ce986e1))
* account/domain soapFetch api used ([14bb748](https://github.com/zextras/carbonio-admin-console-ui/commit/14bb74860acf083cfee81b0ac6d143881bb2eec4))
* add cos features ([#76](https://github.com/zextras/carbonio-admin-console-ui/issues/76)) ([32f195b](https://github.com/zextras/carbonio-admin-console-ui/commit/32f195b393a1a796ff7cc46d2501e63a0d9f5686))
* add helmet icon in virtual host screen ([#12](https://github.com/zextras/carbonio-admin-console-ui/issues/12)) ([375130c](https://github.com/zextras/carbonio-admin-console-ui/commit/375130c62f90ac6e5c29e46e3d193973761a5647))
* added changes fixes to create and verify bucket button ([0fba7ad](https://github.com/zextras/carbonio-admin-console-ui/commit/0fba7add00da46356b98e9fea0de5f0858dea7b1))
* added service for distribution list/remove ([c89392e](https://github.com/zextras/carbonio-admin-console-ui/commit/c89392e643db2146025c592f7196caaa0d6f555f))
* added validation for mailing list ([5534f5e](https://github.com/zextras/carbonio-admin-console-ui/commit/5534f5e2627cc66d0168356c42e36f43d6db0720))
* adjust alignment and header button edit mode ([b18fbee](https://github.com/zextras/carbonio-admin-console-ui/commit/b18fbee3e554cc8e8530cf4fbdeb192bb085aec1))
* autocomplete added in member search ([92af2f6](https://github.com/zextras/carbonio-admin-console-ui/commit/92af2f600de2ebfe0cbeec1a07ea59fe12c52e42))
* backup design ([#25](https://github.com/zextras/carbonio-admin-console-ui/issues/25)) ([caf2dd9](https://github.com/zextras/carbonio-admin-console-ui/commit/caf2dd9fab14a051c859c89738e35c0947130d81))
* breadcrumb issue fixed ([8c36924](https://github.com/zextras/carbonio-admin-console-ui/commit/8c369245a88a60aec202fbf74b8736c2ed3ceb11))
* bucket design ([#31](https://github.com/zextras/carbonio-admin-console-ui/issues/31)) ([263060e](https://github.com/zextras/carbonio-admin-console-ui/commit/263060ef18e6d6a328f85776a804e294ea80b252))
* bucket name and bucket list issue ([052aceb](https://github.com/zextras/carbonio-admin-console-ui/commit/052aceb491a6b4f9a5517f67203e7e5a9f06be8e))
* change add/remove member list ([51f2211](https://github.com/zextras/carbonio-admin-console-ui/commit/51f22112bea69166d9650dacf991f2d8a850abbf))
* change cos advanced design ([#109](https://github.com/zextras/carbonio-admin-console-ui/issues/109)) ([c4e4e78](https://github.com/zextras/carbonio-admin-console-ui/commit/c4e4e781070789c5121e6331afa79d737b19ca80))
* change create domain button primary to secondary ([#20](https://github.com/zextras/carbonio-admin-console-ui/issues/20)) ([3a6c8c5](https://github.com/zextras/carbonio-admin-console-ui/commit/3a6c8c5a5b721866739a42d798ab7d5c1e888775))
* changes reported by vijay in PR ([62a2d83](https://github.com/zextras/carbonio-admin-console-ui/commit/62a2d83b9ad75f61a4c7fe00bbc47b7a9f806f17))
* conflicts resolved ([7bfbe2e](https://github.com/zextras/carbonio-admin-console-ui/commit/7bfbe2e23681797e59550a50dc6779a107eb81b2))
* conflicts resolved ([aa62596](https://github.com/zextras/carbonio-admin-console-ui/commit/aa62596b6b929e42c3ee24619b664970dec7bcd9))
* conflicts resolved ([7f37777](https://github.com/zextras/carbonio-admin-console-ui/commit/7f37777dc44ca3a5004f134d485ca1b7e66195cb))
* conflicts resolved ([a5f989b](https://github.com/zextras/carbonio-admin-console-ui/commit/a5f989bef7c080f8435557cc0a6128d5f6b0daee))
* create volume compressoin issue ([2412f20](https://github.com/zextras/carbonio-admin-console-ui/commit/2412f20431e78dc3b14d2329750397c03e113cb3))
* default redirect to dashboard screen ([#30](https://github.com/zextras/carbonio-admin-console-ui/issues/30)) ([08fe6cd](https://github.com/zextras/carbonio-admin-console-ui/commit/08fe6cdca02590c7b601636b3628de55b470298a))
* delete resource feature ([88603dd](https://github.com/zextras/carbonio-admin-console-ui/commit/88603dd3743a144e5d80a45bb8cb27c30ac969b9))
* delete volume api integrated ([c31fa2d](https://github.com/zextras/carbonio-admin-console-ui/commit/c31fa2d33db380be1238482ac125592ae5d514d2))
* delete/edit mailing list icon added in detail view ([ac0336d](https://github.com/zextras/carbonio-admin-console-ui/commit/ac0336dc07effa4afa45659c838ea4c6480a972f))
* deps and translation issue ([#22](https://github.com/zextras/carbonio-admin-console-ui/issues/22)) ([cdbc0c5](https://github.com/zextras/carbonio-admin-console-ui/commit/cdbc0c5c4fc993710dcd0d69a4fea09bb7360edd))
* design and trans issues ([#138](https://github.com/zextras/carbonio-admin-console-ui/issues/138)) ([93f3b4c](https://github.com/zextras/carbonio-admin-console-ui/commit/93f3b4c892edbb89ffc75262eaa7e88fe2109289))
* detail and manage view ([#15](https://github.com/zextras/carbonio-admin-console-ui/issues/15)) ([3e78c14](https://github.com/zextras/carbonio-admin-console-ui/commit/3e78c14f2d548edd729ac2fbd24d3e1b9575331d))
* detail view based on primary bar expand/collapse ([#46](https://github.com/zextras/carbonio-admin-console-ui/issues/46)) ([fe2a474](https://github.com/zextras/carbonio-admin-console-ui/commit/fe2a474dfe35ac692b042e152d3620d27cf5d449))
* domain creation backend error handle ([#110](https://github.com/zextras/carbonio-admin-console-ui/issues/110)) ([0a94e1e](https://github.com/zextras/carbonio-admin-console-ui/commit/0a94e1ec2659eddc47ae90a6b5181f0625cdc066))
* domain delete and create domain id not set ([#21](https://github.com/zextras/carbonio-admin-console-ui/issues/21)) ([3d7ca6e](https://github.com/zextras/carbonio-admin-console-ui/commit/3d7ca6e9425bbd6d0a0583e5955bda60a9687c2b))
* domain general setting view change ([be35c48](https://github.com/zextras/carbonio-admin-console-ui/commit/be35c4882c253382459368dd321020dfc2b907c1))
* domain selection and cos issue ([#41](https://github.com/zextras/carbonio-admin-console-ui/issues/41)) ([12ec1c6](https://github.com/zextras/carbonio-admin-console-ui/commit/12ec1c69c0f2ea07dd355443bd772c94e3faf707))
* edit mailing list error owner adjust ([e69af81](https://github.com/zextras/carbonio-admin-console-ui/commit/e69af815f95a0bb7c0eecf218d8f4a3edcd893bf))
* edit mode update owner data ([87acb99](https://github.com/zextras/carbonio-admin-console-ui/commit/87acb9962970fbfebbef08f32e0e30ebcd80fb81))
* error handling with snackbar ([e595006](https://github.com/zextras/carbonio-admin-console-ui/commit/e595006b9f176e12bd1f88fca16d73dc8e6352bc))
* error message has been added ([391d5a0](https://github.com/zextras/carbonio-admin-console-ui/commit/391d5a05c90e1dd8a6c169b8ddee8fab73e5ae3f))
* fixed absolute container position ([dc839f7](https://github.com/zextras/carbonio-admin-console-ui/commit/dc839f7e5c5d904b7d4c1e1625bb3f66cd41c394))
* fixed condition issue ([2ad9f5a](https://github.com/zextras/carbonio-admin-console-ui/commit/2ad9f5a3b677e94e3ba0045b485531378822f541))
* fixed deps issues after new PR and added prefix to awss3 ([ce5c0a9](https://github.com/zextras/carbonio-admin-console-ui/commit/ce5c0a98df12ab186995db1e35149eb87516fbac))
* fixed error handling bugs ([941bd62](https://github.com/zextras/carbonio-admin-console-ui/commit/941bd62d0e0b8f66d6a514840ad4f2972915da23))
* fixed get server details two api calls ([dc753d8](https://github.com/zextras/carbonio-admin-console-ui/commit/dc753d82a32a9a8581c8a2dde37b1ad1b8222e94))
* fixed luca and vijay kapil feedback ([d891ba5](https://github.com/zextras/carbonio-admin-console-ui/commit/d891ba5a343dbc40edb36b04f6a7a01b88b4522b))
* fixed modify volume api calls ([5a92703](https://github.com/zextras/carbonio-admin-console-ui/commit/5a927036962afe2fb980e5b187cbf6b99891a22d))
* fixed prefix issue and volumes details ([9768690](https://github.com/zextras/carbonio-admin-console-ui/commit/9768690a86108915b4f25660df2fc0559cb25af0))
* fixed reported issues by emanuele ([ac0ecb3](https://github.com/zextras/carbonio-admin-console-ui/commit/ac0ecb3cd586e91702278d3b875ac918d439d7ca))
* fixed table issue and edit delete layout ([7a9fe37](https://github.com/zextras/carbonio-admin-console-ui/commit/7a9fe37c616ab5ae989c01aedf2783b765cb5d67))
* fixed typos and connect verify flow ([5bb8f8d](https://github.com/zextras/carbonio-admin-console-ui/commit/5bb8f8dfe2c28f65693379affc0c1fb06538801f))
* fixed wizard changes issues ([dc82c2a](https://github.com/zextras/carbonio-admin-console-ui/commit/dc82c2a76a3b421bb3a3dc380bc651f0a2ec05ee))
* height issue fix for the mailing list ([5f001e1](https://github.com/zextras/carbonio-admin-console-ui/commit/5f001e151046c4d88f8b6c35534122c69eac59fe))
* height issue in the edit mailing list ([a3113b5](https://github.com/zextras/carbonio-admin-console-ui/commit/a3113b5e75962b82c643a88a0b4d7e9ec3143eeb))
* is current fixed new ui added fixes ([dbd78cf](https://github.com/zextras/carbonio-admin-console-ui/commit/dbd78cf8a3393c4d3cdad473fb16dba4e0c67218))
* layout issue and delete create volume fix ([e6f1349](https://github.com/zextras/carbonio-admin-console-ui/commit/e6f1349be597b47ea091998d41910e963f21232e))
* ldap query has been added ([c9d4a6f](https://github.com/zextras/carbonio-admin-console-ui/commit/c9d4a6fecb7235484083c98662d74ab7664974a3))
* leave dialog in case of edit mailing list and resources ([#80](https://github.com/zextras/carbonio-admin-console-ui/issues/80)) ([4112b6c](https://github.com/zextras/carbonio-admin-console-ui/commit/4112b6cb3c626196e2153ec54306e559f7a4fa1d))
* logging server list issue ([b2fba3b](https://github.com/zextras/carbonio-admin-console-ui/commit/b2fba3b971a3eae036f748c5e98f4c339b1666bb))
* luca and vijay and kapil feedbacks ([1ed747a](https://github.com/zextras/carbonio-admin-console-ui/commit/1ed747a9f5bbdd862539f423bb8cbd5b0c87d88f))
* mail status UNDO and save functionality added ([c0a19b3](https://github.com/zextras/carbonio-admin-console-ui/commit/c0a19b31f2b72dc059144e0237421304fd1114e2))
* mailing list detail not open ([7d64011](https://github.com/zextras/carbonio-admin-console-ui/commit/7d64011f5ab993c7569520d93e215343d4215aec))
* mailing list issue has been fix for update value ([aec2787](https://github.com/zextras/carbonio-admin-console-ui/commit/aec278746005faa1dcabe188ed250f701b018d00))
* mailing list with query check of ldap ([d1d7f8d](https://github.com/zextras/carbonio-admin-console-ui/commit/d1d7f8d448d4dc5dda4bf2c0c51aeaf04952c5c2))
* merged with devel and resolved issue ([683900b](https://github.com/zextras/carbonio-admin-console-ui/commit/683900b452a4eb3cd2656bc1a5a0da19a4e7e635))
* paging for take account added ([6ef04ed](https://github.com/zextras/carbonio-admin-console-ui/commit/6ef04edefcb2dee6edbfa98ecbbbb432c33e2f84))
* pr feedback fixed ([1e8e9fb](https://github.com/zextras/carbonio-admin-console-ui/commit/1e8e9fb3de5a67b6a2efd19decd05e15ecbc7788))
* prefix added and volumes list called ([d83b851](https://github.com/zextras/carbonio-admin-console-ui/commit/d83b851de241002df3fd2ad0f3abc0154f4338d9))
* redirect to first tab wizard not working ([bf5de10](https://github.com/zextras/carbonio-admin-console-ui/commit/bf5de10b99cc07bcc82d8cd4b05cc8c8c6e382df))
* regular expression in ML ([d96d745](https://github.com/zextras/carbonio-admin-console-ui/commit/d96d7454301e2afd42c3c532df597588a96229c6))
* remove chip input from the edit ML ([860c729](https://github.com/zextras/carbonio-admin-console-ui/commit/860c72963545b7adfcd62e5d41325cc891a4db7a))
* remove duplication code ([#39](https://github.com/zextras/carbonio-admin-console-ui/issues/39)) ([0fcfdda](https://github.com/zextras/carbonio-admin-console-ui/commit/0fcfddadb3f5675e631b9f6bf72293d514cf4dac))
* remove fields from authentication ([#86](https://github.com/zextras/carbonio-admin-console-ui/issues/86)) ([a26330a](https://github.com/zextras/carbonio-admin-console-ui/commit/a26330a6dbdb72f2fbec4a5d077aca2a7de24556))
* removed console ([1400d3b](https://github.com/zextras/carbonio-admin-console-ui/commit/1400d3bc076deed581d8b3bbfc9922dc051f7563))
* removed csrfToken from bucket-service ([1b3d6f3](https://github.com/zextras/carbonio-admin-console-ui/commit/1b3d6f3c6aeb640818d07ae6c2c91bab0bbcd449))
* required field issue ([#130](https://github.com/zextras/carbonio-admin-console-ui/issues/130)) ([a20cfff](https://github.com/zextras/carbonio-admin-console-ui/commit/a20cfff6ba3d62fadb2c958758f5e2ccedad2994))
* reset field after update the account ([b1b2ddf](https://github.com/zextras/carbonio-admin-console-ui/commit/b1b2ddf5b2794660d6f0e727de0a2f2e81e58ef7))
* resolve conflict ([954b16d](https://github.com/zextras/carbonio-admin-console-ui/commit/954b16d4a2912b6a6c323514f0e1edfc2e4fb280))
* resolve conflict ([b028a58](https://github.com/zextras/carbonio-admin-console-ui/commit/b028a58d3b159e36a0069e5583b066b6a3f1618c))
* resolved conflicts and merged with devel ([4e49f75](https://github.com/zextras/carbonio-admin-console-ui/commit/4e49f7586cee25d678076914a1b46e86690c73ef))
* resouce height and width issue fix ([1fe96fc](https://github.com/zextras/carbonio-admin-console-ui/commit/1fe96fc2c8fc25c3e5c4b5fb6cf9bf2954f5e722))
* reverted ([0507008](https://github.com/zextras/carbonio-admin-console-ui/commit/050700890844c190c96f932e7f08447138b07b87))
* right mailing list has been added ([26d4079](https://github.com/zextras/carbonio-admin-console-ui/commit/26d40799f3992e2f62e02773cb5616cf8b539145))
* saving domain public server hostname not working ([7bf618c](https://github.com/zextras/carbonio-admin-console-ui/commit/7bf618c52815ca58e89e5e895ea57b204a7ef0c7))
* search resource and empty view ([9ec6790](https://github.com/zextras/carbonio-admin-console-ui/commit/9ec6790ab38628153be697e6b87207072813df56))
* server list by default open ([64105d9](https://github.com/zextras/carbonio-admin-console-ui/commit/64105d94516389fd90eedcfbf66a141905a2a218))
* show dialog of unsaved changes before losing focus ([#18](https://github.com/zextras/carbonio-admin-console-ui/issues/18)) ([f540c37](https://github.com/zextras/carbonio-admin-console-ui/commit/f540c37c4f56cdd7d5b495d496f01502b2d69e49))
* show ML in table after create ([b9b09d7](https://github.com/zextras/carbonio-admin-console-ui/commit/b9b09d7e678c72c1ad5717e46029fea13b8078bb))
* single and double click event handl ([11377a0](https://github.com/zextras/carbonio-admin-console-ui/commit/11377a01c04696c198ef57c6d1dd86e43c899eb0))
* subscribe/unsubscribe value not change ([3baacbb](https://github.com/zextras/carbonio-admin-console-ui/commit/3baacbbbb35148d44cbb0c81683262b7ff6eb929))
* support weblate trnaslation for bucket type and regions ([8bb6b95](https://github.com/zextras/carbonio-admin-console-ui/commit/8bb6b9525b8fa3742351c66bebcb78e2b9fc9517))
* table height and alignment issue ([e2615d0](https://github.com/zextras/carbonio-admin-console-ui/commit/e2615d082c124547e5465b4afba3622ba0598f0b))
* table layout ([2075b9a](https://github.com/zextras/carbonio-admin-console-ui/commit/2075b9ade40534063bef2ab5ee8eb0af7d5e2b95))
* tooltip translation is not change in case of locale change ([#57](https://github.com/zextras/carbonio-admin-console-ui/issues/57)) ([8797af5](https://github.com/zextras/carbonio-admin-console-ui/commit/8797af500db93902889efa349195e8ea0ace91ef))
* translation encoded strings ([#126](https://github.com/zextras/carbonio-admin-console-ui/issues/126)) ([6ffacbb](https://github.com/zextras/carbonio-admin-console-ui/commit/6ffacbba9b2131557f7e3b0ef50fc543d282362c))
* translation for bold keyword en json ([d8d20d1](https://github.com/zextras/carbonio-admin-console-ui/commit/d8d20d1b386482d0542f1c80e1c77f4e18c52789))
* translation strings ([#139](https://github.com/zextras/carbonio-admin-console-ui/issues/139)) ([c496008](https://github.com/zextras/carbonio-admin-console-ui/commit/c49600846f88969b518d5ff5867f42d5448a0a65))
* translation typo ([#141](https://github.com/zextras/carbonio-admin-console-ui/issues/141)) ([cef681e](https://github.com/zextras/carbonio-admin-console-ui/commit/cef681e0cb4a1381f24af514cb8294210492f9f8))
* typo in en translation ([619b376](https://github.com/zextras/carbonio-admin-console-ui/commit/619b37693a27174a7c3b42c53f36005199a7e37a))
* typo issue ([460f6f8](https://github.com/zextras/carbonio-admin-console-ui/commit/460f6f897d2833cfe0ceb99339b1a037d73f5472))
* ui issues ([#122](https://github.com/zextras/carbonio-admin-console-ui/issues/122)) ([f9b6cdc](https://github.com/zextras/carbonio-admin-console-ui/commit/f9b6cdc4ad6e44ff55a00ceb54301535090c346a))
* update design for start in wizard ([6a031a2](https://github.com/zextras/carbonio-admin-console-ui/commit/6a031a255b56e233993bf3750f35a854d84e8adb))
* update disable to readonly in detail view ([86c8d4e](https://github.com/zextras/carbonio-admin-console-ui/commit/86c8d4ea4d4ee14068bf685e3bea4d55553818ce))
* update the icon for backup ([#29](https://github.com/zextras/carbonio-admin-console-ui/issues/29)) ([aa010c0](https://github.com/zextras/carbonio-admin-console-ui/commit/aa010c035b52ddb298ed6ab99bc477e8693de5c6))
* update the mailing list edit and detail view ([9e622ab](https://github.com/zextras/carbonio-admin-console-ui/commit/9e622abe51a48faa8be201250be00b894f26d4d9))
* update the soap api for offset/limit base paging ([327e055](https://github.com/zextras/carbonio-admin-console-ui/commit/327e0559276c9828d3ea807caf07578241927239))
* update value on change mailing list detial ([d5cb6cf](https://github.com/zextras/carbonio-admin-console-ui/commit/d5cb6cf47035fe0da9501eff9f78d5ad3725a4f1))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
