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
})
