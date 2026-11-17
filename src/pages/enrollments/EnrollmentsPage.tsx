import React from 'react';
import { CandidatesManagementView } from '../../views/secretariat/CandidatesManagementView';

export const EnrollmentsPage: React.FC = () => {
  return <CandidatesManagementView />;
};

export { PublicEnrollmentPage } from '../../views/public/PublicEnrollmentPage';
export default EnrollmentsPage;
