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
})
