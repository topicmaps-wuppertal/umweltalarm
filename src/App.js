import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-cismap/topicMaps.css";
import TopicMapContextProvider from "react-cismap/contexts/TopicMapContextProvider";
import UmweltalarmMap from "./UmweltalarmMap";
import { MappingConstants } from "react-cismap";
import { getInternetExplorerVersion } from "react-cismap/tools/browserHelper";
import { defaultLayerConf } from "react-cismap/tools/layerFactory";
import { useEffect } from "react";

function App() {
  let backgroundModes;
  useEffect(() => {
    document.title = "Umweltalarm Wuppertal";
  }, []);
  if (getInternetExplorerVersion() === -1) {
    backgroundModes = [
      {
        title: "Stadtplan",
        mode: "default",
        layerKey: "stadtplan",
      },
      {
        title: "Stadtplan (Vektordaten light)",
        mode: "default",
        layerKey: "vector",
      },

      { title: "Luftbildkarte", mode: "default", layerKey: "lbk" },
    ];
  } else {
    backgroundModes = [
      {
        title: "Stadtplan",
        mode: "default",
        layerKey: "stadtplan",
      },

      { title: "Luftbildkarte", mode: "default", layerKey: "lbk" },
    ];
  }
  const backgroundConfigurations = {
    lbk: {
      layerkeyx: "cismetText|trueOrtho2020@60",
      layerkey: "wupp-plan-live@100|trueOrtho2020@75|rvrSchrift@100",
      src: "/images/rain-hazard-map-bg/ortho.png",
      title: "Luftbildkarte",
    },
    stadtplan: {
      layerkey: "wupp-plan-live@45",
      src: "/images/rain-hazard-map-bg/citymap.png",
      title: "Stadtplan",
    },
    vector: {
      layerkey: "cismetLight",
      src: "/images/rain-hazard-map-bg/citymap.png",
      title: "Stadtplan",
    },
  };

  // const baseLayerConf = JSON.parse(JSON.stringify(defaultLayerConf));
  // TODO problems in settings preview map wehen doing the immutable way
  const baseLayerConf = { ...defaultLayerConf };

  baseLayerConf.namedLayers.cismetLight = {
    type: "vector",
    style: "https://omt.map-hosting.de/styles/cismet-light/style.json",
    xpane: "backgroundvectorLayers",
  };
  baseLayerConf.namedLayers.cismetText = {
    type: "vector",
    style: "https://omt.map-hosting.de/styles/klokantech-basic/style.json",
    opacity: 0.05,
    iconOpacity: 0.7,
    textOpacity: 0.7,
    xpane: "backgroundlayerTooltips",
  };

  return (
    <TopicMapContextProvider
      baseLayerConf={baseLayerConf}
      backgroundConfigurations={backgroundConfigurations}
      backgroundModes={backgroundModes}
      referenceSystem={MappingConstants.crs3857}
      mapEPSGCode='3857'
      referenceSystemDefinition={MappingConstants.proj4crs3857def}
      maskingPolygon='POLYGON((668010.063156992 6750719.23021889,928912.612468322 6757273.20343972,930494.610325512 6577553.43685138,675236.835570551 6571367.64964125,668010.063156992 6750719.23021889))'
    >
      <UmweltalarmMap />
    </TopicMapContextProvider>
  );
}

export default App;
