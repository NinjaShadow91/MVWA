import React from "react";
import { Dashboard } from "@uppy/react";
import Uppy from "@uppy/core";
import { Form, Tus, Webcam } from "uppy";
import ImageEditor from "@uppy/image-editor";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/image-editor/dist/style.css";
import "@uppy/progress-bar/dist/style.css";
import { trpc } from "../../utils/trpc";
import TrpcApi from "../../pages/api/trpc/[trpc].api";

interface UploaderProps {
  formId: string;
  resultId: string;
  endpoint: string | undefined;
}

export default function Uploader(props: UploaderProps) {
  // const trp

  const trpcMediaTokens = trpc.useMutation("media.protected.add");

  const uppy = React.useMemo(() => {
    const uppy = new Uppy({
      onBeforeFileAdded: (currentFile, files) => {
        console.log(currentFile, files);
        return { ...currentFile, token: "token" };
      },
    });
    uppy.use(Webcam);
    uppy.use(ImageEditor, {
      id: "ImageEditor",
      // quality: 15,
      cropperOptions: {
        viewMode: 1,
        background: false,
        autoCropArea: 1,
        responsive: true,
        croppedCanvasOptions: {},
      },
      actions: {
        revert: true,
        rotate: true,
        granularRotate: true,
        flip: true,
        zoomIn: true,
        zoomOut: true,
        cropSquare: true,
        cropWidescreen: true,
        cropWidescreenVertical: true,
      },
    });
    // uppy.use(Form, {
    //   triggerUploadOnSubmit: true,
    //   addResultToForm: true,
    //   id: props.formId,
    //   resultName: props.resultId,
    // });
    uppy.use(Tus, {
      endpoint: props.endpoint ?? "http://localhost:5000/fileUpload",
      retryDelays: [0, 1000, 3000, 5000],
      onBeforeRequest: async function (req, file) {
        // req.setHeader("Authorization", "Bearer " + file.token);
        await trpcMediaTokens
          .mutateAsync(1)
          .then((res) => {
            if (res.length > 0) {
              req.setHeader("token", res[0]!);
            } else {
              return Promise.reject("No token");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
      onAfterResponse(req, res) {
        console.log(res);
      },
    });

    return uppy;
  }, []);
  React.useEffect(() => {
    return () => uppy.close({ reason: "unmount" });
  }, [uppy]);

  return (
    <Dashboard
      uppy={uppy}
      plugins={["Webcam", "ImageEditor"]}
      proudlyDisplayPoweredByUppy={false}
      width={750}
      height={550}
      thumbnailWidth={280}
      metaFields={[
        {
          id: "altText",
          name: "Alternative Text",
          placeholder: "Alternative Text",
        },
      ]}
      hideUploadButton={true}
    />
  );
}
