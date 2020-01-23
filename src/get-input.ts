import * as core from '@actions/core'
import {context} from '@actions/github'
import {parseBoolean} from './parse-boolean'

interface Inputs {
  owner: string
  repo: string
  ref: string
  token: string
  ignoreOwnCheckSuite: boolean
  waitForACheckSuite: boolean
  intervalSeconds: number
  timeoutSeconds: number | null
  failStepIfUnsuccessful: boolean
  appSlugFilter: string | null
  onlyFirstCheckSuite: boolean
}

export function getInput(): Inputs {
  core.debug(
    JSON.stringify({repository: `${context.repo.owner}/${context.repo.repo}`, ref: context.ref, sha: context.sha})
  )

  // Convert the repository input (`${owner}/${repo}`) into two inputs, owner and repo
  const repository = core.getInput('repository', {required: true})
  const splitRepository = repository.split('/')
  if (splitRepository.length !== 2 || !splitRepository[0] || !splitRepository[1]) {
    throw new Error(`Invalid repository '${repository}'. Expected format {owner}/{repo}.`)
  }
  const owner = splitRepository[0]
  const repo = splitRepository[1]

  // Get the git commit's ref now so it's not pulled multiple times
  const ref = core.getInput('ref', {required: true})

  // ignoreOwnCheckSuite should be true if repository and ref reference the same commit of the current check run
  const ignoreOwnCheckSuite = owner === context.repo.owner && repo === context.repo.repo && ref === context.sha

  // Default the timeout to null
  const timeoutSecondsInput = core.getInput('timeoutSeconds')
  let timeoutSeconds: number | null =
    timeoutSecondsInput && timeoutSecondsInput.length > 0 ? parseInt(timeoutSecondsInput) : null
  if (timeoutSeconds && timeoutSeconds <= 0) {
    timeoutSeconds = null
  }

  // Default the check suites filter to null
  let appSlugFilter: string | null = core.getInput('appSlugFilter')
  appSlugFilter = appSlugFilter && appSlugFilter.length > 0 ? appSlugFilter : null

  return {
    owner,
    repo,
    ref,
    token: core.getInput('token', {required: true}),
    waitForACheckSuite: parseBoolean(core.getInput('waitForACheckSuite', {required: true})),
    ignoreOwnCheckSuite,
    intervalSeconds: parseInt(core.getInput('intervalSeconds', {required: true})),
    timeoutSeconds,
    failStepIfUnsuccessful: parseBoolean(core.getInput('failStepIfUnsuccessful', {required: true})),
    appSlugFilter,
    onlyFirstCheckSuite: parseBoolean(core.getInput('onlyFirstCheckSuite', {required: true}))
  }
}
