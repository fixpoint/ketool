import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('rm', () => {
  it('runs rm cmd', async () => {
    const {stdout} = await runCommand('rm')
    expect(stdout).to.contain('hello world')
  })

  it('runs rm --name oclif', async () => {
    const {stdout} = await runCommand('rm --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
