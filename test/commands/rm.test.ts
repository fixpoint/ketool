import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('rm', () => {
  before(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
    await runCommand('mkdir testdir --cwd /root -k')
    await runCommand('put ./test/data/test.txt --cwd /root/testdir -k')
  })
  after(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
  })

  it('runs rm', async () => {
    const {error} = await runCommand('rm')
    expect(error?.oclif?.exit).to.equal(2)
  })

  it('runs rm --help oclif', async () => {
    const {stdout} = await runCommand('rm --help')
    expect(stdout).to.contain('USAGE')
  })

  it('runs rm test --cwd /root/testdir -kv', async () => {
    const {stdout} = await runCommand('rm test --cwd /root/testdir -kv')
    expect(stdout).to.contain('removed: /root/testdir/test')
  })

  it('runs rm no_such_obj --cwd /root/testdir', async () => {
    const {error, stderr} = await runCommand('rm no_such_obj --cwd /root/testdir -k')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("failed to remove: '/root/testdir/no_such_obj' is not found")
  })

  it('runs rm testdir --cwd /root', async () => {
    const {error, stderr} = await runCommand('rm testdir --cwd /root -k')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("failed to remove: '/root/testdir' is a directory")
  })
})
