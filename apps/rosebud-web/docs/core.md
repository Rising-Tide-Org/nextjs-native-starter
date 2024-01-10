## Client side

We use NextJS as our primary framework for building the web. You can learn a lot about the system by looking through our [next.config.js](../next.config.js).

## Server side

We use the above-mentioned NextJS as our backend framework with routes ranging from a simple CRUD to edge functions that stream the OpenAI payloads to the client.

## Hosting

Our hosting is done through [Vercel](https://vercel.com/just-imagine/rosebud), and we maintain two standard environments:

- prod - Accessible at https://my.rosebud.app
- main - Available via https://swell-sable.vercel.app

These environments directly correspond to the branches in the GitHub repository.

When a Pull Request is generated, our Vercel integration automatically initiates code deployment and generates a domain specific to the branch for testing purposes. These domains are referred to as preview domains. We strongly encourage you to conduct both automated and manual tests on these preview domains instead of opting for local checkouts.

## AI

We build our AI around the GPT model of the OpenAI rest APIs. Even tho our AI is built around a third-party model, the power of Rosebud is in its refined prompt engineering and engaging UX. You can access the [playground here](https://platform.openai.com/playground).

## Reporting and Logs

We use [Mixpanel](https://mixpanel.com/project/2935319) for all analytics and product metrics. It is extensively used on both the client and server side of the app.

We use [Sentry](https://curiotools.sentry.io/) for exception and crash logging. It is a pool of different issues that we occasionally clean and pull tasks from.

We also use Airtable, Typeform and Zapier integration to aggregate the direct user feedback, survey results, payment and cancellations logging into our Slack channels. (#feed-payment, #feed-rosebud-feedback, #feed-rosebud-survey)

## Testing

We use [Playwright](https://playwright.dev/) for automated E2E tests. See [E2E](/e2e) folder for all tests.

## Payment

We use [Stripe](https://dashboard.stripe.com/) to process payments and manage subscriptions, there are a few endpoints and creation sessions, customers, subscriptions and a webhook to listen to events to either update user profiles or dispatch analytics events. To learn more about it look at the [payment document](/docs/stripe-subscriptions.md).

## Releases

We have automated our release process with GitHub Actions, by triggering the "Promote to Prod" action manually in the [repository actions tab](https://github.com/Rising-Tide-Org/swell/actions) it creates a release tag a specific version, updates a version in the `package.json` file and merges `main` branch into `prod` that constitutes the production release. After the merge, another action automatically deploys our code to Vercel and Vercel takes care of the rest.
