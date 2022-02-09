import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { saveAs } from "file-saver";
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
  const [downloadingBanner, setDownloadingBanner] = useState<boolean>(false);
  const [downloadingProfilePic, setDownloadingProfilePic] = useState<boolean>(false);

  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    aspect: MIN_WIDTH_PX / MIN_HEIGHT_PX,
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

  function getCropFactor(image: HTMLImageElement, crop: Crop) {
    // Return what multiple of MIN_WIDTH_PX x MIN_HEIGHT_PX crop should get scaled to
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const width = crop.width * scaleX;
    const height = crop.height * scaleY;

    const factor = Math.max(
      Math.ceil(width / MIN_WIDTH_PX),
      Math.ceil(height / MIN_HEIGHT_PX)
    );

    return factor;
  }

  async function downloadProfilePic() {
    if (!(imageRef.current && crop.width && crop.height)) {
      setErrors(["Invalid image or crop"]);
      return;
    }

    setDownloadingProfilePic(true);

    const image = imageRef.current;

    const factor = getCropFactor(image, crop);
    const pfpWidth = factor * MIN_PFP_PX;

    const margin = (MIN_MARGIN_PX / MIN_HEIGHT_PX) * crop.height;
    const pfpCrop: Partial<Crop> = {
      x: crop.x + margin,
      y: crop.y + margin,
      width: crop.height - 2 * margin,
      height: crop.height - 2 * margin
    };

    cropImage(image, pfpCrop as Crop, pfpWidth, pfpWidth, "profile-picture.png")
      .then(({ blob, fileName }) => {
        saveAs(blob, fileName);
        setDownloadingProfilePic(false);
      })
      .catch((error: Error) => {
        setErrors([error.message]);
        setDownloadingProfilePic(false);
      });
  }

  async function downloadBanner() {
    if (!(imageRef.current && crop.width && crop.height)) {
      setErrors(["Invalid image or crop"]);
      return;
    }

    setDownloadingBanner(true);
    const image = imageRef.current;

    const factor = getCropFactor(image, crop);

    const newWidth = factor * MIN_WIDTH_PX;
    const newHeight = factor * MIN_HEIGHT_PX;

    cropImage(image, crop, newWidth, newHeight, "banner.png")
      .then(({ blob, fileName }) => {
        saveAs(blob, fileName);
        setDownloadingBanner(false);
      })
      .catch((error: Error) => {
        setErrors([error.message]);
        setDownloadingBanner(false);
      });
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
      return new Promise<CropResult>((resolve, reject) =>
        reject(new Error("Context is null"))
      );
    }

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX * pixelRatio,
      crop.height * scaleY * pixelRatio,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<CropResult>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob === null) {
            reject(
              new Error("Canvas is empty (image may be too large for this browser)")
            );
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
        {downloadingBanner ? (
          <Button disabled>PROCESSING...</Button>
        ) : (
          <Button onClick={downloadBanner}>DOWNLOAD BANNER</Button>
        )}
        {downloadingProfilePic ? (
          <Button disabled>PROCESSING...</Button>
        ) : (
          <Button onClick={downloadProfilePic}>DOWNLOAD PROFILE PICTURE</Button>
        )}
      </Grid>
    </>
  );
}
