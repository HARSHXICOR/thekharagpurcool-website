import { getPublicServices } from "@/lib/content";
import { Contact } from "../pages/Contact";

export default async function Page() {
  const services = await getPublicServices();

  return <Contact services={services} />;
}
