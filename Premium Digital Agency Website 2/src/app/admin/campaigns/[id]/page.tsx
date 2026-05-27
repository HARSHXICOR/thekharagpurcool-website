import { AdminCampaignDetail } from "../../../pages/AdminCampaignDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdminCampaignDetail id={id} />;
}
