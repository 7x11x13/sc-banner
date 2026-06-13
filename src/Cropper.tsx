import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { saveAs } from "file-saver";
import { useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  MIN_HEIGHT_PX,
  MIN_WIDTH_PX,
  PFP_DIAMETER_RATIO,
  PFP_MARGIN_RATIO
} from "./Constants";

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
    // Force the crop to the largest whole multiple of MIN_WIDTH_PX x MIN_HEIGHT_PX so the
    // banner exports 1:1 with no scaling. Images whose width isn't a multiple of
    // MIN_WIDTH_PX can't have their whole width selected (the excess is cropped off).
    const factor = getFactor(image);
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    setCrop({
      unit: "px",
      width: (factor * MIN_WIDTH_PX) / scaleX,
      height: (factor * MIN_HEIGHT_PX) / scaleY,
      aspect: MIN_WIDTH_PX / MIN_HEIGHT_PX,
      x: 0,
      y: 0
    } as Crop);
    return false;
  }

  function onCropComplete(crop: Crop) {
    setCrop(crop);
  }

  function onCropChange(crop: Crop, percentageCrop: Crop) {
    setCrop(percentageCrop);
  }

  function getFactor(image: HTMLImageElement) {
    // Largest whole multiple of MIN_WIDTH_PX x MIN_HEIGHT_PX that fits in the image. The
    // banner is exported at exactly this size, sampled 1:1 from the source, so there is no
    // scaling and no aspect-ratio change. Source widths that aren't a multiple of
    // MIN_WIDTH_PX lose their rightmost (width % MIN_WIDTH_PX) pixels.
    return Math.max(
      1,
      Math.min(
        Math.floor(image.naturalWidth / MIN_WIDTH_PX),
        Math.floor(image.naturalHeight / MIN_HEIGHT_PX)
      )
    );
  }

  async function downloadProfilePic() {
    if (!(imageRef.current && crop.width && crop.height)) {
      setErrors(["Invalid image or crop"]);
      return;
    }

    setDownloadingProfilePic(true);

    const image = imageRef.current;
    const factor = getFactor(image);
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const bannerX = Math.round(crop.x * scaleX);
    const bannerY = Math.round(crop.y * scaleY);

    // Avatar = a centered square inset PFP_MARGIN_RATIO and PFP_DIAMETER_RATIO wide, as
    // fractions of the banner height (14 : 99 : 14).
    const bannerHeight = factor * MIN_HEIGHT_PX;
    const margin = PFP_MARGIN_RATIO * bannerHeight;
    const diameter = PFP_DIAMETER_RATIO * bannerHeight;

    // SoundCloud re-encodes the avatar down to 200px (and 500px on retina). If our export
    // size isn't a clean multiple of those, the downscale samples short of the edge and
    // drops ~2px at the right/bottom, shifting the avatar ~1px off the banner. Emit at a
    // multiple of 1000 (integer downscale to both 200 and 500) so it stays seamless.
    const pfpOut = Math.ceil(diameter / 1000) * 1000;

    cropImage(
      image,
      bannerX + margin,
      bannerY + margin,
      diameter,
      diameter,
      pfpOut,
      pfpOut,
      "profile-picture.png"
    )
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

    const factor = getFactor(image);
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const bannerX = Math.round(crop.x * scaleX);
    const bannerY = Math.round(crop.y * scaleY);

    const width = factor * MIN_WIDTH_PX;
    const height = factor * MIN_HEIGHT_PX;

    cropImage(image, bannerX, bannerY, width, height, width, height, "banner.png")
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
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    canvasWidth: number,
    canvasHeight: number,
    fileName: string
  ) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (ctx === null) {
      return new Promise<CropResult>((resolve, reject) =>
        reject(new Error("Context is null"))
      );
    }

    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);

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
