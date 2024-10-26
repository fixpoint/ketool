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
})
