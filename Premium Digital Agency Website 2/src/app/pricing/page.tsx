import { getPublicPricingPlans } from "@/lib/content";
import { Pricing } from "../pages/Pricing";

export default async function Page() {
  const plans = await getPublicPricingPlans();

  return <Pricing plans={plans} />;
}
