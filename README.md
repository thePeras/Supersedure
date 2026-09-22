# Supersedure Studio

A fork of the cleanest database GUI by an individual who want to add some of his ideas on top.

## Attribution

This software is derived from the source code for [Beekeeper Studio](https://github.com/beekeeper-studio/beekeeper-studio), and is a modified version of it.

Beekeeper Studio is a trademark of Beekeeper Studio, Inc. (https://beekeeperstudio.io). Supersedure Studio is not affiliated with, endorsed by, or supported by Beekeeper Studio, Inc. The Beekeeper Studio logos are not used here, in line with the [Beekeeper Studio trademark guidelines](https://www.beekeeperstudio.io/legal/trademark/). Do not file Supersedure Studio bugs against the upstream project.

## Base Features

from starter repository

- (wip)

## Planned features

- (wip)

## Implemented features

- (wip)

## Supported Databases

- [PostgreSQL](https://postgresql.org)
- [MySQL](https://www.mysql.com/)
- [SQLite](https://sqlite.org)
- [SQL Server](https://www.microsoft.com/en-us/sql-server)
- [Amazon Redshift](https://aws.amazon.com/redshift/)
- [CockroachDB](https://www.cockroachlabs.com/)
- [MariaDB](https://mariadb.org/)
- [TiDB](https://pingcap.com/products/tidb/)
- [Google BigQuery](https://cloud.google.com/bigquery)
- [Redis](https://redis.io/)
- [GreengageDB](https://greengagedb.org/)
- [StarRocks](https://www.starrocks.io/)

## Documentation

(wip)

## License

Supersedure Studio is licensed under the GPLv3 license. The code it derives from is Copyright (C) 2020-present Beekeeper Studio, Inc — see [LICENSE.md](./LICENSE.md).

Third party assets bundled with the app, such as the database icons, are credited in [ATTRIBUTIONS.md](./ATTRIBUTIONS.md).

## Contributing

Drop an issue, not a PR.

### Compiling and Running Locally

```bash
# First: Install NodeJS 20, NPM, and Yarn
# ...

# 1. Fork the Repo
# 2. Check out your fork:
git clone git@github.com:<your-username>/supersedure-studio.git supersedure-studio
cd supersedure-studio/
yarn set version classic
nvm use
yarn install # installs dependencies


# Now you can start the app:
yarn run electron:serve ## the app will now start
```

### Where to make changes?

This repo is a monorepo. All app code lives in `apps/studio`, some shared code lives in `shared/src`. This is shared with other apps.

Supersedure Studio has two entry points:

- `background.js` - this is the electron-side code that controls native things like showing windows.
- `main.js` - this is the entry point for the Vue.js app. You can follow the Vue component breadcrumbs from `App.vue` to find the screen you need.

**Generally we have two 'screens':**

- ConnectionInterface - connecting to a DB
- CoreInterface - interacting with a database

### How to submit a change?

- Push your changes to your repository and open a Pull Request from our github page (this page)
- Make sure to write some notes about what your change does! A gif is always welcome for visual changes.

## Maintainer notes (casual readers can ignore this stuff)

### Upgrading Electron Gotchas

This is always a total pain and will break the build 9/10.

Some things you need to consider when upgrading Electron:

1. Does it use a different node version. Eg Electron-18 uses node 14, 22 uses node 16. So everyone needs to upgrade
2. Does node-abi need to be upgraded to be able to understand the electron version? This is used in the build to fetch prebuilt packages. You need to upgrade this in root/package.json#resolutions
3. Were any APIs deprecated or removed? Make sure all features that interact with the Electron APIs still work, stuff like - selecting a file, maximizing a window, running a query, etc.


### Release Process

1. Up the version number in package.json
2. Replace `build/release-notes.md` with the latest release notes. Follow the format that is there.
  - run `git log <last-tag>..HEAD --oneline | grep 'Merge pull'` to find PRs merged
3. Commit
4. Push to master
5. Create a tag `git tag v<version>`. It must start with a 'v'
6. `git push origin <tagname>`
  - Now wait for the build/publish action to complete on Github
7. Push the new release live
  - Go to the new 'draft' release on the releases tab of github, edit the notes, publish
  - Log into snapcraft.io, drag the uploaded release into the 'stable' channel for each architecture.

This should also publish the latest docs
