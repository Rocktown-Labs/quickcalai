import { useUploadFile } from "better-upload/client";
import { UploadButton } from "./upload-button";

export default function Uploader() {
  const { control } = useUploadFile({ route: 'calendar', });

  return <UploadButton control={control} accept='image/*' />;
}
