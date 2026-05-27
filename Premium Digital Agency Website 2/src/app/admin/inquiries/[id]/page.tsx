import { AdminInquiryDetail } from "../../../pages/AdminInquiryDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdminInquiryDetail id={id} />;
}
