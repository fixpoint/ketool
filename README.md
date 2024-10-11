ketool
=================

Development tools for Kompira Enterprise


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ketool.svg)](https://npmjs.org/package/ketool)
[![Downloads/week](https://img.shields.io/npm/dw/ketool.svg)](https://npmjs.org/package/ketool)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ketool
$ ketool COMMAND
running command...
$ ketool (--version)
ketool/0.0.0 linux-x64 node-v20.18.0
$ ketool --help [COMMAND]
USAGE
  $ ketool COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ketool hello PERSON`](#ketool-hello-person)
* [`ketool hello world`](#ketool-hello-world)
* [`ketool help [COMMAND]`](#ketool-help-command)
* [`ketool plugins`](#ketool-plugins)
* [`ketool plugins add PLUGIN`](#ketool-plugins-add-plugin)
* [`ketool plugins:inspect PLUGIN...`](#ketool-pluginsinspect-plugin)
* [`ketool plugins install PLUGIN`](#ketool-plugins-install-plugin)
* [`ketool plugins link PATH`](#ketool-plugins-link-path)
* [`ketool plugins remove [PLUGIN]`](#ketool-plugins-remove-plugin)
* [`ketool plugins reset`](#ketool-plugins-reset)
* [`ketool plugins uninstall [PLUGIN]`](#ketool-plugins-uninstall-plugin)
* [`ketool plugins unlink [PLUGIN]`](#ketool-plugins-unlink-plugin)
* [`ketool plugins update`](#ketool-plugins-update)

## `ketool hello PERSON`

Say hello

```
USAGE
  $ ketool hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ ketool hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/fixpoint/ketool/blob/v0.0.0/src/commands/hello/index.ts)_

## `ketool hello world`

Say hello world

```
USAGE
  $ ketool hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ ketool hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/fixpoint/ketool/blob/v0.0.0/src/commands/hello/world.ts)_

## `ketool help [COMMAND]`

Display help for ketool.

```
USAGE
  $ ketool help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ketool.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.15/src/commands/help.ts)_

## `ketool plugins`

List installed plugins.

```
USAGE
  $ ketool plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ ketool plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/index.ts)_

## `ketool plugins add PLUGIN`

Installs a plugin into ketool.

```
USAGE
  $ ketool plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into ketool.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the KETOOL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the KETOOL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ ketool plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ ketool plugins add myplugin

  Install a plugin from a github url.

    $ ketool plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ ketool plugins add someuser/someplugin
```

## `ketool plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ ketool plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ ketool plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/inspect.ts)_

## `ketool plugins install PLUGIN`

Installs a plugin into ketool.

```
USAGE
  $ ketool plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into ketool.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the KETOOL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the KETOOL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ ketool plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ ketool plugins install myplugin

  Install a plugin from a github url.

    $ ketool plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ ketool plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/install.ts)_

## `ketool plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ ketool plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ ketool plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/link.ts)_

## `ketool plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ketool plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ketool plugins unlink
  $ ketool plugins remove

EXAMPLES
  $ ketool plugins remove myplugin
```

## `ketool plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ ketool plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/reset.ts)_

## `ketool plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ketool plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ketool plugins unlink
  $ ketool plugins remove

EXAMPLES
  $ ketool plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/uninstall.ts)_

## `ketool plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ketool plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ketool plugins unlink
  $ ketool plugins remove

EXAMPLES
  $ ketool plugins unlink myplugin
```

## `ketool plugins update`

Update installed plugins.

```
USAGE
  $ ketool plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/update.ts)_
<!-- commandsstop -->
