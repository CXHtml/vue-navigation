# @vusion/vusion-navigation

> 需要 [vue](https://github.com/vuejs/vue) `2.x` 与 [vue-router](https://github.com/vuejs/vue-router) `2.x`。

## 这是一个什么库

一个让 vue-router 具备在导航时（无论是触发 router.push/router.go、window.history.back 还是浏览器前进后退按钮）可以缓存页面状态的库。

举例：
A、B、C为页面

1. A -> B -> C，A 进到 B 再进入 C 页面
2. C -> B，从 C 返回到 B，B 页面会从缓存中恢复
3. B -> C，再从 B 进到 C 页面，如果该操作是点击浏览器前进按钮，则 C 页面会从缓存中恢复，否则 C 页面将重新生成
4. A -> B -> C -> A，此时历史记录里有两个 A 页面，则之前的 A 页面内的状态会被更新为最新进来的 A 页面状态

## 为何需要它

1. 有时页面内的状态需要被缓存起来，然后在适当的时候（例如返回上一级页面）从缓存中还原，例如我们返回的上一级页面正好是一个表单，那理所当然的返回时希望保留原来表单内填写的内容。
2. Vue-router 控制页面的跳转时，默认都会重新渲染页面实例，这在**点击浏览器前进后退按钮**时与浏览器渲染页面的策略不太一致（在这种情况下，页面内的数据、状态、页面滚动位置等会被保留）

## 原理

1. 参照 vue 可以对组件实施 keep alive 的策略，同样适用于 router-view 内渲染的 vue 实例，只需设置 ```vnode.data.keepAlive = true```
2. 本地维护一份与 browser history 保持一致的路由记录，目的是为了基于这份记录来判断哪些页面需要从缓存中恢复

## 安装

```bash
npm i -S @vusion/vusion-navigation
```

或

```bash
yarn add @vusion/vusion-navigation
```

## 使用
### 事件
方法: [ `on` | `once` | `off` ]

事件类型: [ `forward` | `back` | `replace` | `refresh` | `reset` ]

```js
this.$navigation.on('forward', (to, from) => {})
this.$navigation.once('back', (to, from) => {})
this.$navigation.on('replace', (to, from) => {})
this.$navigation.off('refresh', (to, from) => {})
this.$navigation.on('reset', () => {})
```

## 方法

在全局环境中使用 `Vue.navigation` 或在Vue实例中使用 `this.$navigation`

- `getRoutes()` 获取路由记录
- `cleanRoutes()` 清空路由记录
