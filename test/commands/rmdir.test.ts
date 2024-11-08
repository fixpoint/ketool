import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('rmdir', () => {
  before(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
    await runCommand('mkdir testdir --cwd /root -k')
  })
  after(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
  })

  it('runs rmdir', async () => {
    const {error} = await runCommand('rmdir')
    expect(error?.oclif?.exit).to.equal(2)
  })

  it('runs rmdir --help', async () => {
    const {stdout} = await runCommand('rmdir --help')
    expect(stdout).to.contain('USAGE')
  })

  it('runs rmdir somedir --cwd /root/testdir -k', async () => {
    await runCommand('mkdir somedir --cwd /root/testdir -kv')
    const {stdout} = await runCommand('rmdir somedir --cwd /root/testdir -kv')
    expect(stdout).to.contain('removed directory: /root/testdir/somedir')
  })

  it('runs rmdir foo/bar --cwd /root/testdir -pv', async () => {
    await runCommand('mkdir foo/bar --cwd /root/testdir -kp')
    const {stdout} = await runCommand('rmdir foo/bar --cwd /root/testdir -kvp')
    expect(stdout).to.contain('removed directory: /root/testdir/foo/bar')
    expect(stdout).to.contain('removed directory: /root/testdir/foo')
  })

  it('runs rmdir unknown_dir --cwd /root/testdir -k', async () => {
    const {error, stderr} = await runCommand('rmdir unknown_dir --cwd /root/testdir -kv')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("failed to remove directory: '/root/testdir/unknown_dir' is not found")
  })

  it('runs rmdir unknown_dir --cwd /root/testdir -k', async () => {
    const {error, stderr} = await runCommand('rmdir unknown_dir --cwd /root/testdir -kv')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("failed to remove directory: '/root/testdir/unknown_dir' is not found")
  })

  it('runs rmdir info --cwd /system -k', async () => {
    const {error, stderr} = await runCommand('rmdir info --cwd /system -k')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("failed to remove directory: '/system/info' is not a directory")
  })

  it('runs rmdir /root', async () => {
    const {error, stderr} = await runCommand('rmdir info /root -k')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("failed to remove directory: '/root' is not empty")
  })
})
