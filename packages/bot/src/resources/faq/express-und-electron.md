---
title: 'How do I use Express with Electron?'
---

In general, you don't. Among other things, this behavior opens ports on your
users' computers, which is a security risk even if you only bind them to
localhost. For more details, see:
https://blog.samuelattard.com/using-express-inside-electron/
