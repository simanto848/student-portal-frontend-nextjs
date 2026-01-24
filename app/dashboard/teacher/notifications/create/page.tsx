import { getNotificationTargetOptions } from "../actions";
import CreateNotificationClient from "./fragments/CreateNotificationClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Broadcasting | Teacher Dashboard",
  description: "Create and send notifications to your students",
};

export default async function CreateNotificationPage() {
  const targetOptions = await getNotificationTargetOptions();

  return (
    <CreateNotificationClient initialTargetOptions={targetOptions} />
  );
}
