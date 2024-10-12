import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('mkdir', () => {
  it('runs mkdir cmd', async () => {
    const {stdout} = await runCommand('mkdir')
    expect(stdout).to.contain('hello world')
  })

  it('runs mkdir --name oclif', async () => {
    const {stdout} = await runCommand('mkdir --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
