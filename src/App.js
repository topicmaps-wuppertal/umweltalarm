import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import localforage from "localforage";
import { useEffect, useState } from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { MappingConstants } from "react-cismap";
import TopicMapContextProvider from "react-cismap/contexts/TopicMapContextProvider";
import { getInternetExplorerVersion } from "react-cismap/tools/browserHelper";
import { defaultLayerConf } from "react-cismap/tools/layerFactory";
import "react-cismap/topicMaps.css";
import MapLibreLayer from "react-cismap/vector/MapLibreLayer";
import "./App.css";
import LoginForm from "./components/LoginForm";
import Title from "./components/TitleControl";
import {
  indexAnsprechpartner,
  indexAnsprechpartnerZustaendigkeit,
  initTables,
  md5ActionFetchDAQ4Dexie,
} from "./md5Fetching";
import UmweltalarmMap from "./UmweltalarmMap";
import LogConsole from "react-cismap/tools/LogConsole";

export const appKey = "umweltalarm.Online.Wuppertal";
export const apiUrl = "https://umweltalarm-api.cismet.de";
export const daqKeys = [
  "StoerfallBetriebeKlasse1",
  "StoerfallBetriebeKlasse2",
  "wasserverbaende",
  "wasserschutzgebiete",
  "autobahnmeisterei",
  "landschaftsschutzgebiete",
  "naturschutzgebiete",
  "strassenmeisterei",
  "bimschNrw",
  "bimschWuppertal",
  "trinkwasserbrunnen",
  "stadtFlurstuecke",
];
export const db = initTables(appKey, daqKeys);

function App() {
  let backgroundModes;
  useEffect(() => {
    document.title = "Umweltalarm Wuppertal";
  }, []);
  const showConsole = new URLSearchParams(window.location.href).get("consoleOverlay") !== null;

  const [jwt, _setJWT] = useState();
  const [loggedOut, setLoggedOut] = useState();
  const [loginInfo, setLoginInfo] = useState();
  const [initialised, setInitialised] = useState();
  const [checkedForJWT, setCheckedForJWT] = useState(false);
  const setJWT = (jwt) => {
    // eslint-disable-next-line
    localforage.setItem("@" + appKey + "." + "auth" + "." + "jwt", jwt);
    _setJWT(jwt);
  };

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line
      const jwtInCache = await localforage.getItem("@" + appKey + "." + "auth" + "." + "jwt");
      if (jwtInCache) {
        setJWT(jwtInCache);
        setLoggedOut(false);
        setCheckedForJWT(true);
      } else {
        setJWT(undefined);
        setLoggedOut(true);
        setCheckedForJWT(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (jwt) {
      const tasks = [];
      for (const daqKey of daqKeys) {
        tasks.push(md5ActionFetchDAQ4Dexie(appKey, apiUrl, jwt, daqKey, db));
      }
      tasks.push(md5ActionFetchDAQ4Dexie(appKey, apiUrl, jwt, "ansprechpartner", db));
      tasks.push(md5ActionFetchDAQ4Dexie(appKey, apiUrl, jwt, "ansprechpartnerZustaendigkeit", db));

      Promise.all(tasks).then(
        (results) => {
          for (const result of results) {
            if (result.daqKey === "ansprechpartner" && Array.isArray(result.data)) {
              indexAnsprechpartner(result.data, "ansprechpartner", db);
            } else if (
              result.daqKey === "ansprechpartnerZustaendigkeit" &&
              Array.isArray(result.data)
            ) {
              indexAnsprechpartnerZustaendigkeit(result.data, "ansprechpartnerZustaendigkeit", db);
            }
          }
          setInitialised("initialised complete");
        },
        (problem) => {
          setJWT(undefined);
          setLoginInfo({ color: "#F9D423", text: "Bitte melden Sie sich erneut an." });
          setTimeout(() => {
            setLoginInfo();
          }, 2500);
        }
      );
    } else {
      setLoggedOut(true);
      //      setDynGazData([]);
    }
  }, [jwt]);

  if (getInternetExplorerVersion() === -1) {
    backgroundModes = [
      {
        title: "Stadtplan",
        mode: "default",
        layerKey: "stadtplan",
      },
      {
        title: "Stadtplan (grau)",
        mode: "default",
        layerKey: "vector",
        offlineDataStoreKey: "wuppBasemap",
      },
      {
        title: "Stadtplan (bunt)",
        mode: "default",
        layerKey: "vectorOffline",
        offlineDataStoreKey: "wuppBasemap",
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
      layerkey: "cismetText|trueOrtho2020@40",
      layerkey_: "wupp-plan-live@100|trueOrtho2020@75|rvrSchrift@100",
      src: "/images/rain-hazard-map-bg/ortho.png",
      title: "Luftbildkarte",
    },
    stadtplan: {
      layerkey: "wupp-plan-live@60",
      src: "/images/rain-hazard-map-bg/citymap.png",
      title: "Stadtplan",
    },
    vector: {
      layerkey: "cismetLight",
      src: "/images/rain-hazard-map-bg/citymap.png",
      title: "Stadtplan",
    },
    vectorOffline: {
      layerkey: "osmBrightOffline",
      src: "/images/rain-hazard-map-bg/citymap.png",
      title: "Stadtplan (Offline))",
    },
  };

  const offlineConfig = {
    rules: [
      {
        origin: "https://omt.map-hosting.de/fonts/Metropolis Medium Italic,Noto",
        cachePath: "fonts/Open",
        realServerFallback: false,
      },
      {
        origin: "https://omt.map-hosting.de/fonts/Klokantech Noto",
        cachePath: "fonts/Open",
        realServerFallback: false,
      },
      {
        origin: "https://omt.map-hosting.de/fonts",
        cachePath: "fonts",
        realServerFallback: false,
      },
      {
        origin: "https://omt.map-hosting.de/styles",
        cachePath: "styles",
        realServerFallback: false,
      },

      {
        origin: "https://omt.map-hosting.de/data/v3",
        cachePath: "tiles.wupp",
        realServerFallback: false,
      },

      {
        origin: "https://omt.map-hosting.de/data/gewaesser",
        cachePath: "tiles.gewaesser",
        realServerFallback: false,
      },

      {
        origin: "https://omt.map-hosting.de/data/kanal",
        cachePath: "tiles.kanal",
        realServerFallback: false,
      },

      {
        origin: "https://omt.map-hosting.de/data/brunnen",
        cachePath: "tiles.brunnen",
        realServerFallback: false,
      },
    ],
    dataStores: [
      {
        name: "Vektorkarte für Wuppertal",
        key: "wuppBasemap",
        url: "https://offline-data.cismet.de/offline-data/wupp.new.zip",
      },
      {
        name: "Gewässer, Kanal und Brunnendaten",
        key: "umweltalarm",

        url: "https://offline-data.cismet.de/offline-data/umweltalarm.new.zip",
      },
    ],
    consoleDebug: true,
  };

  // const baseLayerConf = JSON.parse(JSON.stringify(defaultLayerConf));
  // TODO problems in settings preview map wehen doing the immutable way
  const baseLayerConf = { ...defaultLayerConf };

  if (baseLayerConf.namedLayers.cismetLight === undefined) {
    baseLayerConf.namedLayers.cismetLight = {
      type: "vector",
      style: "https://omt.map-hosting.de/styles/cismet-light/style.json",
      pane: "backgroundvectorLayers",
      offlineAvailable: true,
      offlineDataStoreKey: "wuppBasemap",
    };
  }
  if (baseLayerConf.namedLayers.cismetText === undefined) {
    baseLayerConf.namedLayers.cismetText = {
      type: "vector",
      style: "https://omt.map-hosting.de/styles/cismet-text/style.json",
      pane: "backgroundlayerTooltips",
    };
  }
  if (!baseLayerConf.namedLayers.osmBrightOffline) {
    baseLayerConf.namedLayers.osmBrightOffline = {
      type: "vector",
      style: "https://omt.map-hosting.de/styles/osm-bright-grey/style.json",
      offlineAvailable: true,
      offlineDataStoreKey: "wuppBasemap",
      pane: "backgroundvectorLayers",
    };
  }
  let loginForm = null;
  if (loggedOut && checkedForJWT === true && jwt === undefined) {
    loginForm = (
      <LoginForm
        key={"login."}
        setJWT={setJWT}
        loginInfo={loginInfo}
        setLoginInfo={setLoginInfo}
        setLoggedOut={setLoggedOut}
      />
    );
  }

  //MapLibreLayer has a style attribute wich isn't liked by the linter
  //will be fixed soon
  /*eslint react/style-prop-object: "off"*/

  return (
    <TopicMapContextProvider
      persistenceSettings={{
        ui: ["XappMenuVisible", "appMenuActiveMenuSection", "collapsedInfoBox"],
        featureCollection: ["filterState", "filterMode", "clusteringEnabled"],
        responsive: [],
        styling: [
          "activeAdditionalLayerKeys",
          "namedMapStyle",
          "selectedBackground",
          "markerSymbolSize",
        ],
      }}
      additionalLayerConfiguration={{
        brunnen: {
          title: <span>Trinkwasserbrunnen</span>,
          initialActive: false,
          layer: (
            <MapLibreLayer
              key={"brunnen"}
              style='https://omt.map-hosting.de/styles/brunnen/style.json'
              pane='additionalLayers0'
              offlineAvailable={true}
              offlineDataStoreKey='umweltalarm'
            />
          ),
          offlineDataStoreKey: "umweltalarm",
        },
        kanal: {
          title: <span>Kanalnetz</span>,
          initialActive: false,
          layer: (
            <MapLibreLayer
              key={"kanal"}
              style='https://omt.map-hosting.de/styles/kanal/style.json'
              pane='additionalLayers1'
              offlineAvailable={true}
              offlineDataStoreKey='umweltalarm'
            />
          ),
          offlineDataStoreKey: "umweltalarm",
        },
        gewaesser: {
          title: <span>Gewässernetz</span>,
          initialActive: false,
          layer: (
            <MapLibreLayer
              key={"gewaesser"}
              style='https://omt.map-hosting.de/styles/gewaesser/style.json'
              pane='additionalLayers2'
              offlineAvailable={true}
              offlineDataStoreKey='umweltalarm'
            />
          ),
          offlineDataStoreKey: "umweltalarm",
        },
      }}
      baseLayerConf={baseLayerConf}
      offlineCacheConfig={offlineConfig}
      backgroundConfigurations={backgroundConfigurations}
      backgroundModes={backgroundModes}
      referenceSystem={MappingConstants.crs3857}
      mapEPSGCode='3857'
      referenceSystemDefinition={MappingConstants.proj4crs3857def}
      maskingPolygon='POLYGON((668010.063156992 6750719.23021889,928912.612468322 6757273.20343972,930494.610325512 6577553.43685138,675236.835570551 6571367.64964125,668010.063156992 6750719.23021889))'
    >
      {/* {loggedOut && checkedForJWT === true && jwt === undefined && (
        <LoginForm
          key={"login."}
          setJWT={setJWT}
          loginInfo={loginInfo}
          setLoginInfo={setLoginInfo}
        />
      )} */}
      {loginForm}
      {!loggedOut && (
        <Title
          logout={() => {
            setJWT(undefined);
            setLoggedOut(true);
            setLoginInfo({ color: "#69D2E7", text: "Sie wurden erfolgreich abgemeldet." });
            setTimeout(() => {
              setLoginInfo();
            }, 2500);
          }}
          jwt={jwt}
        />
      )}
      {showConsole && <LogConsole ghostModeAvailable={true} minifyAvailable={true} />}

      <UmweltalarmMap loggedOut={loggedOut} initialised={initialised} />
    </TopicMapContextProvider>
  );
}

export default App;
