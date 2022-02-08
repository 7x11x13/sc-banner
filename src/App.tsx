import Alert from "@mui/material/Alert";
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

  function onFilesUploaded(files: File[]) {
    function setFileErrors(errors: string[]) {
      setDropzoneState(DropzoneState.Error);
      setTimeout(() => {
        setDropzoneState(DropzoneState.Default);
      }, 250);
      setErrors(errors);
    }

    if (files.length > 1) {
      setFileErrors(["Please select one file to upload"]);
      return;
    }

    const file = files[0];
    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onabort = () => {
        reject(`${file.name} - file reading was aborted`);
      };

      reader.onerror = () => {
        reject(`${file.name} - file reading failed`);
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
            reject(`Image must be at least ${MIN_WIDTH_PX} x ${MIN_HEIGHT_PX}`);
          } else {
            resolve(reader.result as string);
          }
        };

        image.onabort = () => {
          reject(`${file.name} - image reading was aborted`);
        };

        image.onerror = () => {
          reject(`${file.name} - invalid image`);
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
      .catch((err: string) => {
        setFileErrors([err]);
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
        setErrors={setErrors}
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
          <Typography
            variant="subtitle1"
            fontFamily="Garamond"
            textAlign="center"
            sx={(theme) => ({
              color: theme.palette.primary.main,
              opacity: "75%",
              userSelect: "none"
            })}
          >
            Create a seamless SoundCloud banner
          </Typography>
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
