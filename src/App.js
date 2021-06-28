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
import { useEffect, useState } from "react";
import localforage from "localforage";
import { md5ActionFetchDAQ4Dexie, initTables } from "./md5Fetching";
import LoginForm from "./components/LoginForm";
import Waiting from "./components/Waiting";
import Title from "./components/TitleControl";


const host = "https://wupp-topicmaps-data.cismet.de";
export const appKey = "umweltalarm.Online.Wuppertal";
export const apiUrl = "https://potenzialflaechen-online-api.cismet.de";
export const daqKeys = ['StoerfallBetriebeKlasse1', 'StoerfallBetriebeKlasse2', 'wasserverbaende', 'wasserschutzgebiete', 'autobahnmeisterei', 'landschaftsschutzgebiete', 'naturschutzgebiete', 'strassenmeisterei', 'bimschNrw', 'bimschWuppertal', 'trinkwasserbrunnen', 'stadtFlurstuecke'];
export const db = initTables(appKey, daqKeys);


function App() {
  let backgroundModes;
  useEffect(() => {
    document.title = "Umweltalarm Wuppertal";
  }, []);

  const [jwt, _setJWT] = useState();
  const [loggedOut, setLoggedOut] = useState();
  const [waiting, setWaiting] = useState();
  const [loginInfo, setLoginInfo] = useState();

  const setJWT = (jwt) => {
    localforage.setItem("@" + appKey + "." + "auth" + "." + "jwt", jwt);
    _setJWT(jwt);
  };
    
  useEffect(() => {
    (async () => {
      const jwtInCache = await localforage.getItem("@" + appKey + "." + "auth" + "." + "jwt");
      if (jwtInCache) {
        setJWT(jwtInCache);
        setLoggedOut(false);
      } else {
        setJWT(undefined);
        setLoggedOut(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (jwt) {

      for (const daqKey of daqKeys) {
        md5ActionFetchDAQ4Dexie(appKey, apiUrl, jwt, daqKey, db)
          .then(
            (stoerfallResult) => {
//              alert('drin ' + daqKey);
            },
            (problem) => {
              if (problem.status === 401) {
                setJWT(undefined);
                setLoginInfo({ color: "#F9D423", text: "Bitte melden Sie sich erneut an." });
                setTimeout(() => {
                  setLoginInfo();
                }, 2500);
              }
//              setDynGazData([]);
            }
          )
          .catch((e) => {
            console.log("xxx error ", e);
          });
      }
      setLoggedOut(false);
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

  if (baseLayerConf.namedLayers.cismetLight == undefined) {
    baseLayerConf.namedLayers.cismetLight = {
      type: "vector",
      style_: "http://0.0.0.0:888/styles/cismetplus/style.json",
      style: "https://omt.map-hosting.de/styles/cismetplus/style.json",
      xpane: "backgroundvectorLayers",
    };
  }
  if (baseLayerConf.namedLayers.cismetLight == undefined) {
    baseLayerConf.namedLayers.cismetText = {
      type: "vector",
      style: "http://omt.map-hosting.de/styles/klokantech-basic/style.json",

      opacity: 0.05,
      iconOpacity: 0.7,
      textOpacity: 0.7,
      xpane: "backgroundlayerTooltips",
    };
  }

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
      {loggedOut && jwt === undefined && (
        <LoginForm
          key={"login."}
          setJWT={setJWT}
          loginInfo={loginInfo}
          setLoginInfo={setLoginInfo}
        />
      )}
      {!loggedOut && jwt !== undefined && (
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
      <Waiting waiting={waiting} />

      <UmweltalarmMap />
    </TopicMapContextProvider>
  );
}

export default App;
