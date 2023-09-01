import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { Audio, ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import Pdf from "react-native-pdf";

export default function App() {
  const VIDEO_URL =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const PDF_URL =
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  const [videoUri, setVideoUri] = React.useState();
  const [pdfUri, setPdfUri] = React.useState();
  const [videoError, setVideoError] = React.useState();
  const [pdfError, setPdfError] = React.useState();
  const playerRef = React.useRef();

  React.useEffect(() => {
    async function downloadFile(url, path, setState) {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.documentDirectory + path,
        {
          md5: true,
        }
      );

      try {
        const file = await downloadResumable.downloadAsync();
        const savedFile = await FileSystem.getInfoAsync(file.uri, {
          md5: true,
        });

        if (file?.md5 === savedFile?.md5) {
          setState(file.uri);
          console.log("File downloaded successfully!");
        } else {
          console.error("Corrupted file.");
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function downloadFiles() {
      await downloadFile(VIDEO_URL, "/video.mp4", setVideoUri);
      await downloadFile(PDF_URL, "/pdf.pdf", setPdfUri);
    }

    downloadFiles();
  }, []);

  React.useEffect(() => {
    playerRef.current?.setStatusAsync({
      shouldCorrectPitch: true,
      pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
    });
  }, [playerRef.current]);

  if (videoUri === undefined || pdfUri === undefined) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.center}>Downloading files...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.center}>{"<Video /> component"}</Text>
      {videoError === undefined ? (
        <Video
          resizeMode={ResizeMode.CONTAIN}
          source={{ uri: videoUri }}
          style={styles.flex}
          useNativeControls
          shouldPlay
          ref={playerRef}
          onError={(e) => setVideoError(e)}
        />
      ) : (
        <Text style={styles.error}>{videoError?.toString()}</Text>
      )}
      <Text style={styles.center}>{"<Pdf /> component"}</Text>
      {pdfError === undefined ? (
        <Pdf
          source={{
            uri: pdfUri,
          }}
          trustAllCerts={false}
          style={styles.flex}
          onError={(e) => setPdfError(e)}
        />
      ) : (
        <Text style={styles.error}>{pdfError?.toString()}</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#fff" },
  center: { textAlign: "center", marginTop: 16 },
  flex: { flex: 1 },
  error: { backgroundColor: "red", padding: 16, margin: 16 },
});
