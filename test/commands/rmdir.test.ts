import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('rmdir', () => {
  it('runs rmdir cmd', async () => {
    const {stdout} = await runCommand('rmdir')
    expect(stdout).to.contain('hello world')
  })

  it('runs rmdir --name oclif', async () => {
    const {stdout} = await runCommand('rmdir --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
