import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import fs from 'node:fs/promises'

import * as KeClient from '../../src/client.js'
import Config from '../../src/config.js'

describe('put', () => {
  before(async function () {
    await runCommand('rm testdir --cwd /root -rfk')
    await runCommand('mkdir testdir --cwd /root -k')
    this.config = new Config()
  })
  after(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
  })

  it('runs put', async () => {
    const {error} = await runCommand('put')
    expect(error?.oclif?.exit).to.equal(2)
  })

  it('runs put --help', async () => {
    const {stdout} = await runCommand('put --help')
    expect(stdout).to.contain('USAGE')
  })

  it('runs put ./test/data/test.txt --cwd /root/testdir -v', async function () {
    const {stdout} = await runCommand('put ./test/data/test.txt --cwd /root/testdir -kv')
    expect(stdout).to.contain('created object (/system/types/Text): /root/testdir/test')
    const result = await KeClient.get(this.config, '/root/testdir/test')
    expect(result!.abspath).to.equal('/root/testdir/test')
    expect(result!.type_object).to.equal('/system/types/Text')
    const text = await fs.readFile('./test/data/test.txt', { encoding: 'utf8' })
    expect(result!.fields!.text).to.equal(text)
  })

  it('runs put ./test/data/test2.txt -d test --cwd /root/testdir -v', async function () {
    await runCommand('put ./test/data/test.txt --cwd /root/testdir -kvo')
    const {stdout} = await runCommand('put ./test/data/test2.txt -d test --cwd /root/testdir -kvo')
    expect(stdout).to.contain('updated object (/system/types/Text): /root/testdir/test')
    const result = await KeClient.get(this.config, '/root/testdir/test')
    const text = await fs.readFile('./test/data/test2.txt', { encoding: 'utf8' })
    expect(result!.fields!.text).to.equal(text)
  })

  it('runs put ./test/data/test.txt -d foo --cwd /root/testdir -kv', async () => {
    const {stdout} = await runCommand('put ./test/data/test.txt -d foo --cwd /root/testdir -kv')
    expect(stdout).to.contain('created object (/system/types/Text): /root/testdir/foo')
  })

  it('runs put ./test/data/logo.png --cwd /root/testdir -kv', async function () {
    const {stdout} = await runCommand('put ./test/data/logo.png --cwd /root/testdir -kv')
    expect(stdout).to.contain('created object (/system/types/Binary): /root/testdir/logo')
    const result = await KeClient.get(this.config, '/root/testdir/logo')
    expect(result!.abspath).to.equal('/root/testdir/logo')
    expect(result!.type_object).to.equal('/system/types/Binary')
    const buf = await fs.readFile('./test/data/logo.png')
    expect(result!.fields!.data).to.equal(buf.toString('base64'))
  })

  it('runs put ./test/data/test.txt ./test/data/logo.png -d subdir --cwd /root/testdir -kv', async () => {
    await runCommand('mkdir subdir --cwd /root/testdir -k')
    const {stdout} = await runCommand('put ./test/data/test.txt ./test/data/logo.png -d subdir --cwd /root/testdir -kv')
    expect(stdout).to.contain('created object (/system/types/Text): /root/testdir/subdir/test')
    expect(stdout).to.contain('created object (/system/types/Binary): /root/testdir/subdir/logo')
  })

  it('runs put ./test/data --cwd /root/testdir -r', async () => {
    const {stdout} = await runCommand('put ./test/data --cwd /root/testdir -krv')
    expect(stdout).to.contain('created object (/system/types/Directory): /root/testdir/data')
    expect(stdout).to.contain('created object (/system/types/Text): /root/testdir/data/test')
    expect(stdout).to.contain('created object (/system/types/Text): /root/testdir/data/test2')
    expect(stdout).to.contain('created object (/system/types/Binary): /root/testdir/data/logo')
  })

  it('runs put ./test/data --cwd /root/testdir', async () => {
    const {error, stderr} = await runCommand('put ./test/data --cwd /root/testdir -k')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain('put: -r not specified; omitting directory')
  })

  it('runs put ./test/data/test.txt -d /no/such/dir', async () => {
    const {error} = await runCommand('put ./test/data/test.txt -d /no/such/dir -k')
    expect(error?.oclif?.exit).to.equal(2)
    expect(error?.message).to.contain("failed to put '/no/such/dir': no such object or directory")
  })

  it('runs put ./test/data/test.txt ./test/data/logo.png -d foo --cwd /root/testdir -k', async () => {
    const {error} = await runCommand('put ./test/data/test.txt ./test/data/logo.png -d foo --cwd /root/testdir -k')
    expect(error?.oclif?.exit).to.equal(2)
    expect(error?.message).to.contain("failed to put '/root/testdir/foo': no such object or directory")
  })

  it('runs put no_such_file --cwd /root/testdir', async () => {
    const {error, stderr} = await runCommand('put no_such_file --cwd /root/testdir -k')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain('put: cannot stat')
  })

  it('runs put /dev/null --cwd /root/testdir', async () => {
    const {error, stderr} = await runCommand('put /dev/null --cwd /root/testdir -k')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("put: invalid source '/dev/null': should be file or directory")
  })

  it('runs put ./test/data/test.txt -d info --cwd /system -o', async () => {
    const {error, stderr} = await runCommand('put ./test/data/test.txt -d info --cwd /system -ko')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("put: cannot overwrite /system/info: type '/system/types/SystemInfo' mismatch")
  })

  it('runs put ./test/data -d info --cwd /system -or', async () => {
    const {error, stderr} = await runCommand('put ./test/data -d info --cwd /system -kor')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("put: cannot overwrite /system/info: type '/system/types/SystemInfo' mismatch")
  })
})
