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
ketool/0.1.1 linux-x64 node-v20.18.0
$ ketool --help [COMMAND]
USAGE
  $ ketool COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ketool help [COMMAND]`](#ketool-help-command)
* [`ketool ls [OBJECT]`](#ketool-ls-object)
* [`ketool mkdir DIRECTORY`](#ketool-mkdir-directory)
* [`ketool put SOURCE`](#ketool-put-source)
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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.16/src/commands/help.ts)_

## `ketool ls [OBJECT]`

list information about the OBJECTs.

```
USAGE
  $ ketool ls [OBJECT...] [-u <value>] [-k] [-t <value>] [-c <value>] [-l]

ARGUMENTS
  OBJECT...  file to read

FLAGS
  -c, --cwd=<value>      set current working directory to VALUE
  -k, --insecure         allow insecure SSL connection
  -l, --long             use a long listing format
  -t, --token=<value>    API access token of the Kompira Enterprise server
  -u, --baseurl=<value>  base URL of the Kompira Enterprise server

DESCRIPTION
  list information about the OBJECTs.

EXAMPLES
  $ ketool ls
```

_See code: [src/commands/ls.ts](https://github.com/fixpoint/ketool/blob/v0.1.1/src/commands/ls.ts)_

## `ketool mkdir DIRECTORY`

Create the directories, if they do not already exist.

```
USAGE
  $ ketool mkdir DIRECTORY... [-u <value>] [-k] [-t <value>] [-c <value>] [-p] [-v]

ARGUMENTS
  DIRECTORY...  path of the directory to be created

FLAGS
  -c, --cwd=<value>      set current working directory to VALUE
  -k, --insecure         allow insecure SSL connection
  -p, --parent           no error if existing, make parent directories as needed
  -t, --token=<value>    API access token of the Kompira Enterprise server
  -u, --baseurl=<value>  base URL of the Kompira Enterprise server
  -v, --verbose          print a message for each created directory

DESCRIPTION
  Create the directories, if they do not already exist.

EXAMPLES
  $ ketool mkdir
```

_See code: [src/commands/mkdir.ts](https://github.com/fixpoint/ketool/blob/v0.1.1/src/commands/mkdir.ts)_

## `ketool put SOURCE`

put files or directories to Kompira server

```
USAGE
  $ ketool put SOURCE... [-u <value>] [-k] [-t <value>] [-c <value>] [-d <value>] [-o] [-r] [-v]

ARGUMENTS
  SOURCE...  source file or directory

FLAGS
  -c, --cwd=<value>      set current working directory to VALUE
  -d, --dest=<value>     specify destination object or directory (create if none exists)
  -k, --insecure         allow insecure SSL connection
  -o, --overwrite        overwrite an existing object
  -r, --recursive        put directories recursively
  -t, --token=<value>    API access token of the Kompira Enterprise server
  -u, --baseurl=<value>  base URL of the Kompira Enterprise server
  -v, --verbose          explain what is being down

DESCRIPTION
  put files or directories to Kompira server

EXAMPLES
  $ ketool put
```

_See code: [src/commands/put.ts](https://github.com/fixpoint/ketool/blob/v0.1.1/src/commands/put.ts)_

## `ketool rm OBJECT`

Remove the directories, if they are empty.

```
USAGE
  $ ketool rm OBJECT... [-u <value>] [-k] [-t <value>] [-c <value>] [-f] [-r] [-v]

ARGUMENTS
  OBJECT...  path of the object to be removed

FLAGS
  -c, --cwd=<value>      set current working directory to VALUE
  -f, --force            ignore nonexistent objects and arguments
  -k, --insecure         allow insecure SSL connection
  -r, --recurcive        remove directories and their contents recursively
  -t, --token=<value>    API access token of the Kompira Enterprise server
  -u, --baseurl=<value>  base URL of the Kompira Enterprise server
  -v, --verbose          print a message for each removed directory

DESCRIPTION
  Remove the directories, if they are empty.

EXAMPLES
  $ ketool rm
```

_See code: [src/commands/rm.ts](https://github.com/fixpoint/ketool/blob/v0.1.1/src/commands/rm.ts)_

## `ketool rmdir DIRECTORY`

Remove the directories, if they are empty.

```
USAGE
  $ ketool rmdir DIRECTORY... [-u <value>] [-k] [-t <value>] [-c <value>] [-p] [-v]

ARGUMENTS
  DIRECTORY...  path of the directory to be removed

FLAGS
  -c, --cwd=<value>      set current working directory to VALUE
  -k, --insecure         allow insecure SSL connection
  -p, --parent           remove DIRECTORY and its ancestors
  -t, --token=<value>    API access token of the Kompira Enterprise server
  -u, --baseurl=<value>  base URL of the Kompira Enterprise server
  -v, --verbose          print a message for each removed directory

DESCRIPTION
  Remove the directories, if they are empty.

EXAMPLES
  $ ketool rmdir
```

_See code: [src/commands/rmdir.ts](https://github.com/fixpoint/ketool/blob/v0.1.1/src/commands/rmdir.ts)_
<!-- commandsstop -->
