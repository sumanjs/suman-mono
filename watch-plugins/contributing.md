
# How to create a new Suman-Watch plugin

## What are suman-watch-plugins for?

If you don't know, the purpose of this project's plugins, is so that suman-watch can hook into other watchers <p>
such as `webpack -w` and `tsc -w`.

<p>
This currently only works by reading from the stdout of the other watchers to find out when builds are ready to execute.

## Creating your plugin

Your plugin must adhere to the interface given by `index.ts`.
You can use `suman-watch-plugins/modules/tsc` as an example.