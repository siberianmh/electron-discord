---
title:
  '`Uncaught ReferenceError: require is not defined` even if `nodeIntegration`
  is set to `true`'
---

Starting from Electron v12.0.0, the default value of `contextIsolation` changed
from `false` to `true`, which prevents use of `require` in the renderer even if
`nodeIntegration` is enabled. Primarily for security reasons, instead of using
`require` in the renderer, we recommend that you instead use `contextBridge` in
a preload script to provide functions to the renderer process instead of using
`require`. You can use this example Electron Fiddle :fiddle: gist as a starting
point for your code:
<https://gist.github.com/malept/6670289ff76db1b675b0c347bc8c5d68>.

If you accept the security risks
(<https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content>)
and still want to use `require` in the renderer process, you can change the
value of `contextIsolation` to `false` and `nodeIntegration` to `true`.

For more information, see
<https://www.electronjs.org/docs/breaking-changes#default-changed-contextisolation-defaults-to-true>
and <https://www.electronjs.org/docs/tutorial/context-isolation>.
