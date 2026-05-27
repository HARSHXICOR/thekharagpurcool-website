import { getPublicServices } from "@/lib/content";
import { Services } from "../pages/Services";

export default async function Page() {
  const services = await getPublicServices();

  return <Services services={services} />;
}
