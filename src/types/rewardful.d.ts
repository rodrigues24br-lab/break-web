interface RewardfulGlobal {
  referral: string | null;
}

interface Window {
  Rewardful?: RewardfulGlobal;
  rewardful?: (event: string, callback?: () => void) => void;
}
