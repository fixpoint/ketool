import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('put', () => {
  before(async () => {
    await runCommand('rm testdir --cwd /root -rfk')
    await runCommand('mkdir testdir --cwd /root -k')
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

  it('runs put ./test/data/test.txt --cwd /root/testdir -kv', async () => {
    const {stdout} = await runCommand('put ./test/data/test.txt --cwd /root/testdir -kv')
    expect(stdout).to.contain('created text: /root/testdir/test')
  })
})
