import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('ls', () => {
  it('runs ls --help', async () => {
    const {stdout} = await runCommand('ls --help')
    expect(stdout).to.contain('USAGE')
  })

  it('runs ls', async () => {
    const {stdout} = await runCommand('ls -k')
    expect(stdout).to.contain('system')
  })

  it('runs ls no_such_obj', async () => {
    const {error, stderr} = await runCommand('ls -k no_such_obj')
    expect(error?.oclif?.exit).to.equal(1)
    expect(stderr).to.contain("failed to get '/no_such_obj'")
  })

  it('runs ls --cwd /system/types TypeObject Directory', async () => {
    const {stdout} = await runCommand('ls --cwd /system/types TypeObject Directory -k')
    expect(stdout).to.contain('TypeObject')
    expect(stdout).to.contain('Directory')
  })

  it('runs ls --cwd /system info config -l', async () => {
    const {stdout} = await runCommand('ls --cwd /system info config -kl')
    expect(stdout).to.contain('info:/system/types/SystemInfo')
    expect(stdout).to.contain('config:/system/types/Config')
  })

  it('runs ls /system', async () => {
    const {stdout} = await runCommand('ls /system -k')
    expect(stdout).to.contain('types')
    expect(stdout).to.contain('channels')
    expect(stdout).to.contain('info')
  })

  it('runs ls --cwd /system smtp_servers packages', async () => {
    const {stdout} = await runCommand('ls --cwd /system smtp_servers packages -k')
    expect(stdout).to.contain('/system/smtp_servers:')
    expect(stdout).to.contain('  Default')
    expect(stdout).to.contain('/system/packages:')
    expect(stdout).to.contain('  PIP')
  })

  it('runs ls /process', async () => {
    const {stdout} = await runCommand('ls /process -k')
    expect(stdout).to.equal('')
  })
})
