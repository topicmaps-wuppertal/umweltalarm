import bboxPolygon from "@turf/bbox-polygon";
import booleanIntersects from "@turf/boolean-intersects";
import turfCenter from "@turf/center";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useContext } from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { md5FetchJSON, md5FetchText } from "react-cismap/tools/fetching";
import { getGazDataForTopicIds } from "react-cismap/tools/gazetteerHelper";
import "react-cismap/topicMaps.css";
import ResponsiveInfoBox from "react-cismap/topicmaps/ResponsiveInfoBox";
import TopicMapComponent from "react-cismap/topicmaps/TopicMapComponent";
import "./App.css";
import MyMenu from "./components/Menu";
import Crosshair from "./Crosshair";
import { md5ActionFetchDAQ4Dexie, initTables } from "./md5Fetching";
import {searchForFeatures} from "./search"
import {appKey, daqKeys, db} from "./App";
import buffer from "@turf/buffer"
import circle from "@turf/circle"
import InfoBox from "./components/InfoBox";
import InfoPanel from "./components/SecondaryInfo";
import { ResponsiveTopicMapContext } from "react-cismap/contexts/ResponsiveTopicMapContextProvider";

const host = "https://wupp-topicmaps-data.cismet.de";

const getData = async (setGazData, setInfoData) => {
  const prefix = "GazDataForStories";
  const sources = {};

//  sources.stoerfallbetrieb = await md5ActionFetchDAQ4Dexie(prefix, 'url', 'xxx', 'daqStoerfallBetriebeKlasse1');
  sources.adressen = await md5FetchText(prefix, host + "/data/3857/adressen.json");
  sources.bezirke = await md5FetchText(prefix, host + "/data/3857/bezirke.json");
  sources.quartiere = await md5FetchText(prefix, host + "/data/3857/quartiere.json");
  sources.pois = await md5FetchText(prefix, host + "/data/3857/pois.json");
  sources.kitas = await md5FetchText(prefix, host + "/data/3857/kitas.json");

  const gazData = getGazDataForTopicIds(sources, [
    "pois",
    "kitas",
    "bezirke",
    "quartiere",
    "adressen",
  ]);

  setGazData(gazData);
};

function UmweltalarmMap({loggedOut}) {
  const [gazData, setGazData] = useState([]);
  const [infoData, setInfoData] = useState([]);
  const [hits, setHits] = useState([]);
  const { windowSize } = useContext(ResponsiveTopicMapContext);

  useEffect(() => {
    getData(setGazData, setInfoData);
  }, []);
  return (
    <div>
      <Crosshair />
      <TopicMapComponent
        gazData={gazData}
        modalMenu={<MyMenu />}
        homeZoom={13}
        maxZoom={22}
        secondaryInfo={windowSize && <InfoPanel hits={hits} />}
    
        mappingBoundsChanged={(boundingBox) => {
          setHits(undefined);
          let bbox = [boundingBox.left, boundingBox.bottom, boundingBox.right, boundingBox.top];
          let bbPoly = bboxPolygon(bbox);
          //   console.log("xxx mappingBoundsChanged", center);
          let center = turfCenter(bbPoly);
//          console.log(center.geometry.coordinates);
          const hits = searchForFeatures(db, daqKeys, center).then((hits)=>{
            setHits(hits);
          });
        }}
      >
        { !loggedOut &&  <InfoBox hits={hits}/>}
      </TopicMapComponent>
    </div>
  );
}

export default UmweltalarmMap;
