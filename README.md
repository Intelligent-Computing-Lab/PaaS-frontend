# PaaS 前端页面
首先将项目克隆到本地，需要实现下载好yarn包管理工具
## 1.拉取依赖
根目录执行

```
$ yarn config set registry https://registry.npm.taobao.org
$ yarn config list
$ yarn install
```


## 2.若项目依赖拉取出现错误可执行尝试几次如下操作并重新执行第一步

```
$  yarn cache clean
$  yarn --update-checksums
```
## 3.设置代码允许ip访问（不然只能localhost访问）

```
$ 全局替换81.70.216.174为自己的服务器ip即可
```

## 4.启动

执行以下命令，再选择输入start即可

```
$ yarn run
```
