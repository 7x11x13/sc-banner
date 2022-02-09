import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/system";
import { useState } from "react";
import { MIN_HEIGHT_PX, MIN_WIDTH_PX } from "./Constants";
import Cropper from "./Cropper";
import Dropzone, { DropzoneState } from "./Dropzone";
import { DARK_THEME, DEFAULT_THEME } from "./Themes";

enum AppState {
  Waiting,
  Processing
}

export default function App() {
  const [errors, setErrors] = useState<string[]>([]);
  const [state, setState] = useState<AppState>(AppState.Waiting);
  const [img, setImg] = useState<string>("");
  const [dropzoneState, setDropzoneState] = useState<DropzoneState>(
    DropzoneState.Default
  );
  const [dropzoneProgress, setDropzoneProgress] = useState<number>(0);

  function setFileErrors(errors: string[]) {
    setDropzoneState(DropzoneState.Error);
    setTimeout(() => {
      setDropzoneState(DropzoneState.Default);
    }, 250);
    setErrors(errors);
  }

  function onFilesUploaded(files: File[]) {
    if (files.length > 1) {
      setFileErrors(["Please select one file to upload"]);
      return;
    }

    const file = files[0];
    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onabort = () => {
        reject(new Error(`${file.name} - file reading was aborted`));
      };

      reader.onerror = () => {
        reject(new Error(`${file.name} - file reading failed`));
      };

      reader.onloadstart = () => {
        setDropzoneProgress(0);
        setDropzoneState(DropzoneState.Uploading);
      };

      reader.onprogress = (event) => {
        setDropzoneProgress(event.loaded / event.total);
      };

      reader.onload = () => {
        setDropzoneProgress(1);
        const image = new Image();

        image.onload = () => {
          if (image.naturalHeight < MIN_HEIGHT_PX || image.naturalWidth < MIN_WIDTH_PX) {
            reject(
              new Error(`Image must be at least ${MIN_WIDTH_PX} x ${MIN_HEIGHT_PX}`)
            );
          } else {
            resolve(reader.result as string);
          }
        };

        image.onabort = () => {
          reject(new Error(`${file.name} - image reading was aborted`));
        };

        image.onerror = () => {
          reject(new Error(`${file.name} - invalid image`));
        };

        image.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
    promise
      .then((dataURL) => {
        setDropzoneState(DropzoneState.Default);
        setDropzoneProgress(0);
        setImg(dataURL as string);
        setErrors([]);
        setState(AppState.Processing);
      })
      .catch((err: Error) => {
        setFileErrors([err.message]);
        setDropzoneProgress(0);
      });
  }

  function goBack() {
    setState(AppState.Waiting);
    setErrors([]);
  }

  function isDarkTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  const stateToComponentMap: Record<AppState, JSX.Element> = {
    [AppState.Waiting]: (
      <Dropzone
        onFilesUploaded={onFilesUploaded}
        setErrors={setFileErrors}
        state={dropzoneState}
        progress={dropzoneProgress}
      />
    ),
    [AppState.Processing]: <Cropper img={img} setErrors={setErrors} goBack={goBack} />
  };

  const component = stateToComponentMap[state];

  return (
    <ThemeProvider theme={isDarkTheme() ? DARK_THEME : DEFAULT_THEME}>
      <CssBaseline />
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        spacing="1em"
      >
        <Grid item key="title">
          <Typography
            variant="h3"
            textAlign="center"
            sx={(theme) => ({
              color: theme.palette.primary.main
            })}
          >
            sc-banner
          </Typography>
          <Box
            component="a"
            href="https://github.com/7x11x13/sc-banner/tree/main"
            target="_blank"
            rel="noreferrer"
            sx={(theme) => ({
              "&:hover": {
                "& *": {
                  color: theme.palette.primary.light
                },
                "& svg": {
                  fill: theme.palette.primary.light
                }
              }
            })}
          >
            <Typography
              variant="subtitle1"
              fontFamily="Garamond"
              textAlign="center"
              sx={(theme) => ({
                color: theme.palette.primary.main,
                opacity: "75%",
                userSelect: "none",
                verticalAlign: "middle",
                display: "inline-block"
              })}
            >
              <Box
                component="svg"
                maxWidth="1.3em"
                maxHeight="1.3em"
                viewBox="0 0 1024 1024"
                strokeWidth="0"
                margin="0 0.45em"
                top="0.3em"
                sx={(theme) => ({
                  fill: theme.palette.primary.main,
                  display: "inline-block",
                  position: "relative"
                })}
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                  transform="scale(64)"
                />
              </Box>
              Create a seamless SoundCloud banner
            </Typography>
          </Box>
        </Grid>
        {component}
        {errors.length > 0 ? (
          <Grid item key="errors">
            {errors.map((error) => (
              <Alert variant="outlined" severity="error" key={error}>
                {error}
              </Alert>
            ))}
          </Grid>
        ) : null}
      </Grid>
    </ThemeProvider>
  );
}
