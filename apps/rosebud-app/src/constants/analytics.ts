export enum MixpanelUserProps {
  referralCode = 'Referral Code',
  totalReferrals = 'Total Referrals',
  totalReferralCredits = 'Total Referral Credits',
  lifetimeRevenue = 'Lifetime Revenue',
  subscriptionStatus = 'Subscription Status',
  cancellationReason = 'Cancellation Reason',
  cancellationFeedback = 'Cancellation Feedback',
  cancellationComment = 'Cancellation Comment',
  canceledAtDate = 'Canceled At Date',
  referringPlatform = 'Referring Platform',
  upgradeSource = 'Upgrade Source',
}

export const kDefaultMixpanelUserProps = {
  [MixpanelUserProps.totalReferrals]: 0,
  [MixpanelUserProps.totalReferralCredits]: 0,
}
