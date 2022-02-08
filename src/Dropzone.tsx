import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/system";
import { useCallback, useState } from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import { MIN_HEIGHT_PX, MIN_WIDTH_PX } from "./Constants";
import "./Dropzone.css";

export enum DropzoneState {
  Default,
  Uploading,
  Error
}

interface DropzoneProps {
  onFilesUploaded: (files: File[]) => void;
  setErrors: (errors: string[]) => void;
  state: DropzoneState;
  progress: number;
}

export default function Dropzone(props: DropzoneProps) {
  const { progress, state, onFilesUploaded, setErrors } = props;

  const [hovered, setHovered] = useState<boolean>(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[], event: DropEvent) => {
      onDragEnd();
      if (acceptedFiles.length >= 1) {
        onFilesUploaded(acceptedFiles);
      } else if (rejections.length > 1) {
        setErrors(["Please select one file to upload"]);
      } else if (rejections.length === 1) {
        const errors: string[] = [];
        for (const fileRejection of rejections) {
          const fileName = fileRejection.file.name;
          for (const { message } of fileRejection.errors) {
            errors.push(`${fileName} - ${message}`);
          }
        }
        setErrors(errors);
      }
    },
    [onFilesUploaded, setErrors]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDrop,
    multiple: false
  });

  function onDragEnter() {
    setHovered(true);
  }

  function onDragEnd() {
    setHovered(false);
  }

  function getBorderColor(theme: Theme, state: DropzoneState) {
    switch (state) {
      case DropzoneState.Default:
        return theme.palette.secondary.dark;
      case DropzoneState.Error:
        return theme.palette.error.main;
      case DropzoneState.Uploading:
        return theme.palette.secondary.dark;
    }
  }

  return (
    <Grid item key="main">
      <Box
        className={hovered ? "dropzone hover" : "dropzone"}
        {...getRootProps()}
        onDragEnter={onDragEnter}
        onDragLeave={onDragEnd}
        width="100%"
        height="100%"
        sx={(theme) => ({
          position: "relative",
          color: theme.palette.secondary.dark,
          bgcolor: theme.palette.secondary.light,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2em",
          outline: "none"
        })}
      >
        <Box
          component="svg"
          width="100%"
          height="100%"
          sx={(theme) => ({
            stroke: getBorderColor(theme, state),
            fill: getBorderColor(theme, state),
            strokeWidth: "10",
            position: "absolute",
            zIndex: "1",
            left: "0",
            top: "0"
          })}
        >
          <line className="top" x1="0" y1="0" x2="100%" y2="0" />
          <line className="top" x1={200 - 30 + "%"} y1="0" x2="300%" y2="0" />
          <line className="left" x1="0" y1="100%" x2="0" y2="0" />
          <line className="left" x1="0" y1="-200%" x2="0" y2={-100 + 30 + "%"} />
          <line className="bottom" x1="100%" y1="100%" x2="0" y2="100%" />
          <line className="bottom" x1="-200%" y1="100%" x2={-100 + 30 + "%"} y2="100%" />
          <line className="right" x1="100%" y1="0" x2="100%" y2="100%" />
          <line className="right" x1="100%" y1={200 - 30 + "%"} x2="100%" y2="300%" />
          <rect
            className="loading-bar"
            x="-100%"
            y="0"
            width="100%"
            height="100%"
            stroke="none"
            style={{
              transform: `translateX(${progress * 100}%)`
            }}
          />
        </Box>
        <Typography
          variant="h5"
          style={{ userSelect: "none", zIndex: "2", textAlign: "center", lineHeight: 2 }}
        >
          Drag and drop image here or click to upload <br />
        </Typography>
        <Typography
          variant="h6"
          fontFamily="Garamond"
          fontStyle="italic"
          style={{ userSelect: "none", zIndex: "2", textAlign: "center", lineHeight: 2 }}
        >
          Recommended size: 6200 x 1300 <br />
          For best results use a multiple of {MIN_WIDTH_PX} x {MIN_HEIGHT_PX}
        </Typography>
        <input {...getInputProps()} />
      </Box>
    </Grid>
  );
}
