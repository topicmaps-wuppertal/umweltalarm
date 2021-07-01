import bboxPolygon from "@turf/bbox-polygon";
import booleanIntersects from "@turf/boolean-intersects";
import turfCenter from "@turf/center";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
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

  // const ns = await md5FetchJSON(prefix, host + "/data/3857/naturschutzgebiete.json");
  // const ls = await md5FetchJSON(prefix, host + "/data/3857/landschaftsschutzgebiete.json");
  // for (const f of ns) {
  //   f.crs = {
  //     type: "name",
  //     properties: {
  //       name: "urn:ogc:def:crs:EPSG::25832",
  //     },
  //   };
  // }
  // for (const f of ls) {
  //   f.crs = {
  //     type: "name",
  //     properties: {
  //       name: "urn:ogc:def:crs:EPSG::25832",
  //     },
  //   };
  // }
  // setInfoData([ns, ls]);
};

function UmweltalarmMap() {
  const [gazData, setGazData] = useState([]);
  const [infoData, setInfoData] = useState([]);
  const [hits, setHits] = useState([]);
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
        mappingBoundsChanged={(boundingBox) => {
          setHits(undefined);
          let bbox = [boundingBox.left, boundingBox.bottom, boundingBox.right, boundingBox.top];
          let bbPoly = bboxPolygon(bbox);
          let center = turfCenter(bbPoly);
          //   console.log("xxx mappingBoundsChanged", center);
          console.log(center);
//          console.log( buffer(center, 1, {units: 'meters'} ) );
//          console.log( circle(center, 1, {units: 'meters'} ) );
          const hits = searchForFeatures(db, daqKeys, center).then((hits)=>{
            setHits(hits);
          });
        }}
      >
        <InfoBox hits={hits}/>
      </TopicMapComponent>
    </div>
  );
}

export default UmweltalarmMap;
