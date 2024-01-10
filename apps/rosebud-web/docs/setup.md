1. Install [Brew](https://brew.sh), [NVM](https://github.com/nvm-sh/nvm) and [Yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable).

2. Clone the repo and install dependencies:

   ```sh
   git clone git@github.com:Rising-Tide-Org/swell.git
   cd swell
   nvm install
   nvm use
   yarn install
   ```

3. Ask your fellow colleague for a copy of their `.env.local` file.

4. You will need to run the database locally. The instructions to run an emulator can be found in this [guide](/docs/emulators-setup.md).

5. Run the frontend and backend with one command from the root `swell/` directory:

   ```sh
   yarn dev
   ```

6. Learn about the codebase and all major pieces in [core](/docs/core.md), learn about the approach in [developer-workflow](/docs/developer-workflow.md)
