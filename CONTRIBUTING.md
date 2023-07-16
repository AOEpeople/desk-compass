# Contributing to Desk Compass

## Getting started

Before you begin:

- Check out the [existing issues](https://github.com/AOEpeople/desk-compass/issues).
- Browse the [developer guide](README.md#developer-guide) for tips on setup, running the tests.

## Don't see your issue? Open one

If you spot something new, open an issue. We'll use the issue to have a conversation about the problem you want to fix. If we need more information in order to look into issue we'll respond on the issue and also and mark the issue as `more-information-needed`.

## Ready to make a change?

### Fork the repo

### Build and run the project

Follow the steps in [developer guide](README.md#developer-guide) to get the project running locally.

### Make your changes to the file(s) you'd like to update.

To ensure consistency throughout the source code, keep these rules in mind as you are working:

- All features or bug fixes must be tested by one or more specs (unit-tests).
- Make sure all (unit and end-to-end) tests are still running (`yarn test` and `yarn e2e`)
- Make use of provided linters and formatters.

### Make a commit

We adhere to conventional commits, please refer to the specs for more details: https://www.conventionalcommits.org/en/v1.0.0/

If possible include the affected module / part of Desk Compass:

- `feat(frontend): make sidebar collapsible`
- `fix(api): fix parsing of UTF-8 characters`
- `chore: update dependency xyz`

A commit message is supposed to tell what has changed.

### Open a pull request

When you're done making changes and you'd like to propose them for review by opening a pull request.

### Submit your PR

- After that, we may have questions, check back on your PR to keep up with the conversation.
- Did you have an issue, like a merge conflict? Check out GitHub's [git tutorial](https://lab.github.com/githubtraining/managing-merge-conflicts) on how to resolve merge conflicts and other issues.

### Your PR is merged!

Congratulations! And thank you for your contribution :sparkles:
