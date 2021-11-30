# Experimental Modules

## Threads Help Channels

> Can be enabled via providing `ENABLE_THREAD_CHANNELS` environment variable

This module adds the ability to replace the default help channels with threads.
A user asks a question on some general channel and the bot will create the
thread, the user no more able to write the messages to this channel and should
use the thread, the thread will automatically close after the `12` (can be
customized), or after the user writes `/close` command.

This module is can be an interest for the `Framework` or `Ecosystem` category to
provide the users in these channels an own place for the questions but will be
still possible to use to replace the `General` help channel system.
