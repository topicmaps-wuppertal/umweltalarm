import { useEffect, useContext } from "react";

import "./App.css";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-cismap/topicMaps.css";
import { md5FetchText, fetchJSON, md5FetchJSON } from "react-cismap/tools/fetching";
import { getGazDataForTopicIds } from "react-cismap/tools/gazetteerHelper";

import { ResponsiveTopicMapContext } from "react-cismap/contexts/ResponsiveTopicMapContextProvider";
import { getClusterIconCreatorFunction } from "react-cismap/tools/uiHelper";
import TopicMapComponent from "react-cismap/topicmaps/TopicMapComponent";
import FeatureCollection from "react-cismap/FeatureCollection";
import GenericInfoBoxFromFeature from "react-cismap/topicmaps/GenericInfoBoxFromFeature";
import getGTMFeatureStyler from "react-cismap/topicmaps/generic/GTMStyler";

const host = "https://wupp-topicmaps-data.cismet.de";

const getData = async (setGazData, setInfoData) => {
  const prefix = "GazDataForStories";
  const sources = {};
  sources.adressen = await md5FetchText(prefix, host + "/data/adressen.json");
  sources.bezirke = await md5FetchText(prefix, host + "/data/bezirke.json");
  sources.quartiere = await md5FetchText(prefix, host + "/data/quartiere.json");
  sources.pois = await md5FetchText(prefix, host + "/data/pois.json");
  sources.kitas = await md5FetchText(prefix, host + "/data/kitas.json");

  const gazData = getGazDataForTopicIds(sources, [
    "pois",
    "kitas",
    "bezirke",
    "quartiere",
    "adressen",
  ]);

  setGazData(gazData);

  const ns = await md5FetchJSON(prefix, host + "/data/naturschutzgebiete.json");
  const ls = await md5FetchJSON(prefix, host + "/data/landschaftsschutzgebiete.json");
  setInfoData([ns, ls]);
};

function UmweltalarmMap() {
  const { windowSize } = useContext(ResponsiveTopicMapContext);

  const [gazData, setGazData] = useState([]);
  const [infoData, setInfoData] = useState([]);
  useEffect(() => {
    getData(setGazData, setInfoData);
  }, []);
  return (
    <div>
      <div
        style={{
          position: "absolute",
          top: windowSize?.height / 2 - 1,
          width: windowSize?.width || "100%",
          height: "2px",
          backgroundColor: "#00000023",
          zIndex: "100000",
          pointerEvents: "none",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          left: windowSize?.width / 2 - 1,
          height: windowSize?.height || "100%",
          width: "2px",
          backgroundColor: "#00000023",
          zIndex: "100000",
          pointerEvents: "none",
        }}
      ></div>
      <div
        style={{
          borderRadius: "50%",
          position: "absolute",
          left: windowSize?.width / 2 - 10,
          top: windowSize?.height / 2 - 10,
          height: "20px",
          width: "20px",
          backgroundColor: "#00000023",
          zIndex: "100000",
          pointerEvents: "none",
        }}
      ></div>
      <TopicMapComponent gazData={gazData}></TopicMapComponent>
    </div>
  );
}

export default UmweltalarmMap;
