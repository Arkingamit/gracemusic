
import { useParams } from 'next/navigation';
import OrganizationDetailComponent from '@/components/OrganizationDetail';

const OrganizationDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Invalid organization ID</div>;

  return <OrganizationDetailComponent id={id} />;
};

export default OrganizationDetailPage;
