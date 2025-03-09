import MainScreen from "@/screens/MainScreen/MainScreen";
import "@/assets/global.css";

// Wrapper component for the application,
// which renders the MainScreen component and may include other global components
// such as routers, context providers, modals, etc.

// example: https://github.com/EcoPasteHub/EcoPaste/blob/master/src/App.tsx
// router example: https://github.com/EcoPasteHub/EcoPaste/blob/master/src/router/index.ts

export default function App() {
  return (
    <>
      <MainScreen />
    </>
  );
}
