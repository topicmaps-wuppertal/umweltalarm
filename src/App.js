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
          console.log("xxx result", results);

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

  // useEffect(() => {
  //   if (jwt) {
  //     let newDataRetrieved = false;
  //     let keysChecked = 0;
  //     for (const daqKey of daqKeys) {
  //       md5ActionFetchDAQ4Dexie(appKey, apiUrl, jwt, daqKey, db)
  //         .then(
  //           (result) => {
  //             ++keysChecked;

  //             if (result.data && Array.isArray(result.data)) {
  //               newDataRetrieved = true;
  //             }

  //             if (keysChecked > daqKeys.length - 1 && newDataRetrieved === true) {
  //               //reload the hits after the data retrieval is complete
  //               setInitialised("initialised complete");
  //             }
  //           },
  //           (problem) => {
  //             if (problem.status === 401) {
  //               setJWT(undefined);
  //               setLoginInfo({ color: "#F9D423", text: "Bitte melden Sie sich erneut an." });
  //               setTimeout(() => {
  //                 setLoginInfo();
  //               }, 2500);
  //             }
  //           }
  //         )
  //         .catch((e) => {
  //           console.log("xxx error ", e);
  //         });
  //     }

  //     md5ActionFetchDAQ4Dexie(appKey, apiUrl, jwt, "ansprechpartner", db)
  //       .then(
  //         (stoerfallResult) => {
  //           if (stoerfallResult !== undefined && Array.isArray(stoerfallResult.data)) {
  //             indexAnsprechpartner(stoerfallResult.data, "ansprechpartner", db);
  //           }
  //         },
  //         (problem) => {
  //           if (problem.status === 401) {
  //             setJWT(undefined);
  //             setLoginInfo({ color: "#F9D423", text: "Bitte melden Sie sich erneut an." });
  //             setTimeout(() => {
  //               setLoginInfo();
  //             }, 2500);
  //           }
  //         }
  //       )
  //       .catch((e) => {
  //         console.log("xxx error ", e);
  //       });

  //     md5ActionFetchDAQ4Dexie(appKey, apiUrl, jwt, "ansprechpartnerZustaendigkeit", db)
  //       .then(
  //         (stoerfallResult) => {
  //           if (stoerfallResult !== undefined && Array.isArray(stoerfallResult.data)) {
  //             console.log("Ansprechpartner referenz");
  //             indexAnsprechpartnerZustaendigkeit(
  //               stoerfallResult.data,
  //               "ansprechpartnerZustaendigkeit",
  //               db
  //             );
  //           }
  //         },
  //         (problem) => {
  //           if (problem.status === 401) {
  //             setJWT(undefined);
  //             setLoginInfo({ color: "#F9D423", text: "Bitte melden Sie sich erneut an." });
  //             setTimeout(() => {
  //               setLoginInfo();
  //             }, 2500);
  //           }
  //         }
  //       )
  //       .catch((e) => {
  //         console.log("xxx error ", e);
  //       });

  //     setLoggedOut(false);
  //   } else {
  //     setLoggedOut(true);
  //     //      setDynGazData([]);
  //   }
  // }, [jwt]);

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
  };

  // const baseLayerConf = JSON.parse(JSON.stringify(defaultLayerConf));
  // TODO problems in settings preview map wehen doing the immutable way
  const baseLayerConf = { ...defaultLayerConf };

  if (baseLayerConf.namedLayers.cismetLight === undefined) {
    baseLayerConf.namedLayers.cismetLight = {
      type: "vector",
      style: "https://omt.map-hosting.de/styles/cismet-light/style.json",
      pane: "backgroundvectorLayers",
    };
  }
  if (baseLayerConf.namedLayers.cismetText === undefined) {
    baseLayerConf.namedLayers.cismetText = {
      type: "vector",
      style: "https://omt.map-hosting.de/styles/cismet-text/style.json",
      pane: "backgroundlayerTooltips",
    };
  }
  let loginForm = null;
  if (loggedOut && checkedForJWT === true && jwt === undefined) {
    loginForm = (
      <LoginForm key={"login."} setJWT={setJWT} loginInfo={loginInfo} setLoginInfo={setLoginInfo} />
    );
  }

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
          initialActive: true,
          layer: (
            <MapLibreLayer
              key={"brunnen"}
              style_='http://localhost:888/styles/brunnen/style.json'
              style='https://omt.map-hosting.de/styles/brunnen/style.json'
              pane='additionalLayers0'
            />
          ),
        },
        kanal: {
          title: <span>Kanalnetz</span>,
          initialActive: true,
          layer: (
            <MapLibreLayer
              key={"kanal"}
              style_='http://localhost:888/styles/kanal/style.json'
              style='https://omt.map-hosting.de/styles/kanal/style.json'
              pane='additionalLayers1'
            />
          ),
        },
        gewaesser: {
          title: <span>Gewässernetz</span>,
          initialActive: true,
          layer: (
            <MapLibreLayer
              key={"gewaesser"}
              style_='http://localhost:888/styles/gewaesser/style.json'
              style='https://omt.map-hosting.de/styles/gewaesser/style.json'
              pane='additionalLayers2'
            />
          ),
        },
      }}
      baseLayerConf={baseLayerConf}
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

      <UmweltalarmMap loggedOut={loggedOut} initialised={initialised} />
    </TopicMapContextProvider>
  );
}

export default App;
