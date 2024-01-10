## Introduction

We use [Stripe](https://dashboard.stripe.com/) to process payments and manage subscriptions. It is complex and we went through many iterations as a team improving it and clarifying it for ourselves.

Stripe allows the developers to work with themselves in a variety of ways, through pure REST, through an SDK or a set of UI components. Currently, our setup is very simple we have our UI that pulls subscription information, creates customers and generates the portal link for users to modify and work with their subscriptions via Stripe's UI.

Additionally, to track all of the side effects of the subscription that happens outside of the scope of our UI (like successful payment for a subscription) we have an extensive [webhook](/src/pages/api/hooks/stripe.ts) that is configured to receive events on both `main` and `prod` environments.

## Webhook development flow

To test and develop our [stripe.ts](/src/pages/api/hooks/stripe.ts) webhook.

First ensure that you have `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` in .env

Install Stripe client

```
brew install stripe/stripe-cli/stripe
```

Then make sure that your local server is running and forward all of the test events to the hosted webhook

```
stripe listen --forward-to http://localhost:3000/api/hooks/stripe
```

From here on out you can mock and dispatch any events available to Stripe, the below command will produce and list of supported events.

```
stripe trigger --help
```

```
stripe trigger customer.subscription.created
```

The interesting part here is that Stripe will intelligently mock the event or simply dispatch the most recent event that it received on its [testing server](https://dashboard.stripe.com/test).

You can also modify the data that will be dispatched with the event by adding `--edit` flag.

e.g

```
stripe trigger customer.subscription.created --edit
```

This will open up a vim editor in the terminal. Each webhook trigger will require adding custom metadata for the customer.

See [customer.subscription.update](./stripe/customer.subscription.update.json) for reference.

## Note on testing stripe subscriptions

For the stripe subscriptions you can use it by subscribing or paying for the product via some of the testing cards they provider, you can use it locally or on the preview environment like `main`.

[The documentation](https://stripe.com/docs/testing#cards) also contains cards that will be declined with a various testing codes.

### Note on simulating past_due status for the subscription

1. Create a test clock [here](https://dashboard.stripe.com/test/test-clocks)
2. Adding a new customer to test clock
3. Adding a new subscription to the customer, with 7 day trial and card number `4000000000004954`
4. Add your uid to the customer metadata
5. Delete subscription object from your Firestore user
6. Advanced the test clock beyond the trial end date
7. Refresh your browser
