import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('rm', () => {
  before(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
    await runCommand('mkdir testdir --cwd /root -k')
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
})
