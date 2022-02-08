import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { MIN_HEIGHT_PX, MIN_MARGIN_PX, MIN_PFP_PX, MIN_WIDTH_PX } from "./Constants";

interface CropResult {
  fileName: string;
  blob: Blob;
}

interface CropperProps {
  img: string;
  setErrors: (errors: string[]) => void;
  goBack: () => void;
}

export default function Cropper(props: CropperProps) {
  const { img, setErrors, goBack } = props;
  const [downloading, setDownloading] = useState<boolean>(false);

  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    aspect: 62 / 13,
    x: 0,
    y: 0
  } as Crop);
  const imageRef = useRef<HTMLImageElement>();

  function onImageLoaded(image: HTMLImageElement) {
    imageRef.current = image;
  }

  function onCropComplete(crop: Crop) {
    setCrop(crop);
  }

  function onCropChange(crop: Crop, percentageCrop: Crop) {
    setCrop(percentageCrop);
  }

  async function downloadBanner() {
    if (imageRef.current && crop.width && crop.height) {
      setDownloading(true);
      const image = imageRef.current;

      const pixelRatio = window.devicePixelRatio;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const oldWidth = crop.width * pixelRatio * scaleX;
      const oldHeight = crop.height * pixelRatio * scaleY;

      const factor = Math.max(
        Math.ceil(oldWidth / MIN_WIDTH_PX),
        Math.ceil(oldHeight / MIN_HEIGHT_PX)
      );
      const newWidth = factor * MIN_WIDTH_PX;
      const newHeight = factor * MIN_HEIGHT_PX;
      const pfpWidth = factor * MIN_PFP_PX;

      const margin = (MIN_MARGIN_PX / MIN_HEIGHT_PX) * crop.height;
      const pfpCrop: Partial<Crop> = {
        x: crop.x + margin,
        y: crop.y + margin,
        width: crop.height - 2 * margin,
        height: crop.height - 2 * margin
      };

      const promises = [
        cropImage(image, crop, newWidth, newHeight, "banner.png"),
        cropImage(image, pfpCrop as Crop, pfpWidth, pfpWidth, "profile-picture.png")
      ];
      Promise.all(promises)
        .then((blobs) => {
          const zip = new JSZip();
          for (const { blob, fileName } of blobs) {
            zip.file(fileName, blob as any);
          }
          zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "sc-banner.zip");
            setDownloading(false);
          });
        })
        .catch((reason) => {
          setErrors([reason]);
          setDownloading(false);
        });
    }
  }

  async function cropImage(
    image: HTMLImageElement,
    crop: Crop,
    canvasWidth: number,
    canvasHeight: number,
    fileName: string
  ) {
    const pixelRatio = window.devicePixelRatio;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (ctx === null) {
      return new Promise<CropResult>((resolve, reject) => reject("Context is null"));
    }

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<CropResult>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob === null) {
            reject("Canvas is empty (image may be too large for this browser)");
            return;
          }
          resolve({ blob: blob, fileName: fileName });
        },
        "image/png",
        1
      );
    });
  }

  return (
    <>
      <Grid item key={"main"}>
        <ReactCrop
          src={img}
          crop={crop}
          minWidth={MIN_WIDTH_PX}
          minHeight={MIN_HEIGHT_PX}
          onImageLoaded={onImageLoaded}
          onChange={onCropChange}
          onComplete={onCropComplete}
          keepSelection
          locked
          style={{
            maxHeight: "80vh",
            maxWidth: "90vh",
            objectFit: "contain",
            display: "flex",
            alignItems: "stretch"
          }}
        />
      </Grid>
      <Grid item key="buttons">
        <Button onClick={goBack}>BACK</Button>
        {downloading ? (
          <Button disabled>PROCESSING...</Button>
        ) : (
          <Button onClick={downloadBanner}>DOWNLOAD</Button>
        )}
      </Grid>
    </>
  );
}
