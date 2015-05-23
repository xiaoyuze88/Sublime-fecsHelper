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

## 已知ISSUE

1. 当格式错误过多时，调用fecs format会throw error。
原因猜测是fecs会在format完后对buffer做一次JSLint的检查，如果JSLint报错过多，会认为可能是fecs format导致的格式错误，从而阻止从buffer覆盖源文件。
但底层fecs format它throw error后会使得python调起的调用node的子进程挂掉（CalledProcessError），从而导致格式化失败。  
解决方案： 当格式错误过多时，先修改一部分已知错误后再尝试，如遇格式化失败可以打开Sublime的console（ctrl+`）查看具体错误原因，如报CalledProcessError，基本是如上问题。
