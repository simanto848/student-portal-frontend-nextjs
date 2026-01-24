import { getDepartmentHeadNotificationTargetOptions } from "./actions";
import CreateDepartmentNotificationClient from "./fragments/CreateDepartmentNotificationClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Broadcast | Department Head Dashboard",
  description: "Create and send notifications as department head",
};

export default async function CreateDepartmentNotificationPage() {
  const targetOptions = await getDepartmentHeadNotificationTargetOptions();

  return (
    <CreateDepartmentNotificationClient initialTargetOptions={targetOptions} />
  );
}
