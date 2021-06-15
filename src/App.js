import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-cismap/topicMaps.css";
import TopicMapContextProvider from "react-cismap/contexts/TopicMapContextProvider";
import UmweltalarmMap from "./UmweltalarmMap";

function App() {
  return (
    <TopicMapContextProvider>
      <UmweltalarmMap />
    </TopicMapContextProvider>
  );
}

export default App;
