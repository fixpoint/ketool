import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('ls', () => {
  before(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
    await runCommand('mkdir testdir --cwd /root -k')
  })
  after(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
  })

  it('runs ls --help', async () => {
    const {stdout} = await runCommand('ls --help')
    expect(stdout).to.contain('USAGE')
  })
})
