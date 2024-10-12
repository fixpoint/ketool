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
* [`ketool help [COMMAND]`](#ketool-help-command)
* [`ketool mkdir DIRECTORY`](#ketool-mkdir-directory)
* [`ketool rm OBJECT`](#ketool-rm-object)
* [`ketool rmdir DIRECTORY`](#ketool-rmdir-directory)

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

## `ketool mkdir DIRECTORY`

Create the directories, if they do not already exist.

```
USAGE
  $ ketool mkdir DIRECTORY... [-u <value>] [-t <value>] [-c <value>] [-p] [-v]

ARGUMENTS
  DIRECTORY...  path of the directory to be created

FLAGS
  -c, --cwd=<value>      set current working directory to VALUE
  -p, --parent           no error if existing, make parent directories as needed
  -t, --token=<value>    API access token of the Kompira Enterprise server
  -u, --baseurl=<value>  base URL of the Kompira Enterprise server
  -v, --verbose          print a message for each created directory

DESCRIPTION
  Create the directories, if they do not already exist.

EXAMPLES
  $ ketool mkdir
```

_See code: [src/commands/mkdir.ts](https://github.com/fixpoint/ketool/blob/v0.0.0/src/commands/mkdir.ts)_

## `ketool rm OBJECT`

Remove the directories, if they are empty.

```
USAGE
  $ ketool rm OBJECT... [-u <value>] [-t <value>] [-c <value>] [-f] [-r] [-v]

ARGUMENTS
  OBJECT...  path of the object to be removed

FLAGS
  -c, --cwd=<value>      set current working directory to VALUE
  -f, --force            ignore nonexistent objects and arguments
  -r, --recurcive        remove directories and their contents recursively
  -t, --token=<value>    API access token of the Kompira Enterprise server
  -u, --baseurl=<value>  base URL of the Kompira Enterprise server
  -v, --verbose          print a message for each removed directory

DESCRIPTION
  Remove the directories, if they are empty.

EXAMPLES
  $ ketool rm
```

_See code: [src/commands/rm.ts](https://github.com/fixpoint/ketool/blob/v0.0.0/src/commands/rm.ts)_

## `ketool rmdir DIRECTORY`

Remove the directories, if they are empty.

```
USAGE
  $ ketool rmdir DIRECTORY... [-u <value>] [-t <value>] [-c <value>] [-p] [-v]

ARGUMENTS
  DIRECTORY...  path of the directory to be removed

FLAGS
  -c, --cwd=<value>      set current working directory to VALUE
  -p, --parent           remove DIRECTORY and its ancestors
  -t, --token=<value>    API access token of the Kompira Enterprise server
  -u, --baseurl=<value>  base URL of the Kompira Enterprise server
  -v, --verbose          print a message for each removed directory

DESCRIPTION
  Remove the directories, if they are empty.

EXAMPLES
  $ ketool rmdir
```

_See code: [src/commands/rmdir.ts](https://github.com/fixpoint/ketool/blob/v0.0.0/src/commands/rmdir.ts)_
<!-- commandsstop -->
