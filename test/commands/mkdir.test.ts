import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('mkdir', () => {
  before(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
    await runCommand('mkdir testdir --cwd /root -k')
  })
  after(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
  })

  it('runs mkdir', async () => {
    const {error} = await runCommand('mkdir')
    expect(error?.oclif?.exit).to.equal(2)
  })

  it('runs mkdir --help', async () => {
    const {stdout} = await runCommand('mkdir --help')
    expect(stdout).to.contain('USAGE')
  })

  it('runs mkdir somedir --cwd /root/testdir -kv', async() => {
    const {stdout} = await runCommand('mkdir somedir --cwd /root/testdir -kv')
    expect(stdout).to.contain('created directory: /root/testdir/somedir')
  })

  it('runs mkdir subdir/foo --cwd /root/testdir -p', async() => {
    const {stdout} = await runCommand('mkdir subdir/foo --cwd /root/testdir -kpv')
    expect(stdout).to.contain('created directory: /root/testdir/subdir')
    expect(stdout).to.contain('created directory: /root/testdir/subdir/foo')
  })

  it('runs mkdir foo/bar --cwd /root/testdir', async() => {
    const {error} = await runCommand('mkdir foo/bar --cwd /root/testdir -k')
    expect(error?.oclif?.exit).to.equal(2)
    expect(error?.message).to.contain("cannot create directory: parent directory '/root/testdir/foo' is not found")
  })

  it('runs mkdir info/foo --cwd /system', async() => {
    const {error} = await runCommand('mkdir info/foo --cwd /system -k')
    expect(error?.oclif?.exit).to.equal(2)
    expect(error?.message).to.contain("cannot create directory: parent directory '/system/info' is not directory")
  })
})
