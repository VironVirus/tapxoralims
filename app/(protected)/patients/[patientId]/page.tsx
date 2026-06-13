import { PatientHistory } from "@/features/patients/patient-history";

export default async function PatientHistoryPage({
  params
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;

  return <PatientHistory patientId={patientId} />;
}
