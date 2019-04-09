# @vusion/vusion-navigation

> require [vue](https://github.com/vuejs/vue) `2.x` and [vue-router](https://github.com/vuejs/vue-router) `2.x`。

## What is it

A library that can cache the pages state when using vue-router, no matter how you trigger the forward/back behavior by invoking router.push/router.go, window.history.back or the forward/back button of native browser.

For instance：
A、B、C are pages

1. A -> B -> C，A forward to B, then forward to C
2. C -> B，C back to B，then B will restore its state from cache
3. B -> C，then B forward to C，if you forward page by pressing the native browser button, C will restore from cache, otherwise, rebuild C 
4. A -> B -> C -> A，now there're two A instance in the history list, the older one's state will be replaced by the newer one

## Why need this

1. Sometimes states of pages need to be cached and then restore them at specific time, like back to the previous page which may has a form you've filled previously.
2. The default behavior of vue-router is to create new instance of the router view when navigate to page, however this is not consistent with the behavior of **triggering the forward/back button of native browser**. Under such circumstance, data, state, scroll bar position will be retained.

## Install

```bash
npm i -S @vusion/vusion-navigation
```

or

```bash
yarn add @vusion/vusion-navigation
```

## Usage
### Event
Functions: [ `on` | `once` | `off` ]

Event types: [ `forward` | `back` | `replace` | `refresh` | `reset` ]

```js
this.$navigation.on('forward', (to, from) => {})
this.$navigation.once('back', (to, from) => {})
this.$navigation.on('replace', (to, from) => {})
this.$navigation.off('refresh', (to, from) => {})
this.$navigation.on('reset', () => {})
```

## Methods

Use `Vue.navigation` in global environment or use `this.$navigation` in vue instance.

- `getRoutes()` get the routing records
- `cleanRoutes()` clean the routing records
