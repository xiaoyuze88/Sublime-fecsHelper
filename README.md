# 公司内部代码规范检查器

由JSHint gutter修改而来，底层换成公司的node检查库[fecs](https://github.com/ecomfe/fecs)

支持fecs format与fecs check功能。

fecs check用法基本同JSHint Gutter，默认在Sublime中保存文件后调用check，错误展示同JSHint。

fecs format的默认快捷键是cmd(ctrl) + shift + h，可自行配置。

## 使用方法

整个包下载下来后放于Sublime的Packages内，可以通过从Sublime菜单 - Preferences - Browser Packages找到该目录，放进去后即可使用。

## 注意

1. 关于Windows由于手头没Windows的环境，对Windows的Sublime还没测试，不过应该在配置内的Node path设置正确的话，没有问题。
2. 目前仅测试了Sublime 3，Sublime 2未做测试，不过JSHint本身是兼容ST2的，应该能用。
3. 该插件为组内在公司官方IDE插件未推出前应急用的，难免有测试不到位的，公司官方IDE插件支持推出后该REPO将不再维护。

如发现问题，欢迎提ISSUE或者加HI联系: xiaoyuze88@gmail.com


