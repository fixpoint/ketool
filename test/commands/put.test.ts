import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('put', () => {
  it('runs put cmd', async () => {
    const {stdout} = await runCommand('put')
    expect(stdout).to.contain('hello world')
  })

  it('runs put --name oclif', async () => {
    const {stdout} = await runCommand('put --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
