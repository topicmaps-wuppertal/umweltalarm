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
import { searchForFeatures } from "./search";
import { appKey, daqKeys, db } from "./App";

import InfoBox from "./components/InfoBox";
import InfoPanel from "./components/SecondaryInfo";
import { ResponsiveTopicMapContext } from "react-cismap/contexts/ResponsiveTopicMapContextProvider";
import FeatureCollection, { getDefaultFeatureStyler } from "react-cismap/FeatureCollection";
import { FeatureCollectionDisplay } from "react-cismap";

import Color from "color";

const host = "https://wupp-topicmaps-data.cismet.de";

const getData = async (setGazData) => {
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

const convertToFeature = (_item) => {
  const item = JSON.parse(JSON.stringify(_item));

  const geometry = item?.geojson;
  const selected = false;
  const type = "Feature";
  let text = item?.bezeichnung;
  switch (item.typ) {
    case "naturschutzgebiete":
      text = item?.nrw_name;
      item.color = "#649351";
      break;
    case "landschaftsschutzgebiete":
      text = "Landschaftsschutzgebiet";
      item.color = "#97C146";

      break;
    case "stadtFlurstuecke":
      text = item?.flurstueck;
      item.color = "#dddddd";
      item.opcaity = 0.3;
      break;
    case "trinkwasserbrunnen":
      text = item?.str_name + " " + item?.hsnr;
      item.color = "#A7DBD8";
      item.opcaity = 0.3;

      break;
    case "bimschWuppertal":
      text = item?.b_firma1;
      item.color = "#774F38";

      break;
    case "bimschNrw":
      text = item?.b_firma1;
      item.color = "#774F38";

      break;
    case "wasserschutzgebiete":
      text = item?.zone;
      item.color = "#69D2E7";

      break;
    case "StoerfallBetriebeKlasse1":
      text = item?.betrieb;
      item.color = "#DD4A36";
      break;
    case "StoerfallBetriebeKlasse2":
      text = item?.betrieb;
      item.color = "#DD4A36";
      item.opacity = 0.3;

      break;

    default:
      return undefined;
      break;
  }

  return {
    id: item.typ + "." + item.id,
    text,
    type,
    selected,
    geometry,
    crs: geometry?.crs || {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:EPSG::25832",
      },
    },
    properties: item,
  };
};

const style = (feature) => {
  let color = new Color(feature?.properties?.color || "#ff0000");
  let linecolor = new Color(feature?.properties?.color || "#ff0000").darken(0.5);

  return {
    fillColor: color,
    color: linecolor,
    opacity: 0.5,
    fillOpacity: feature?.properties?.opacity || 0.6,

    weight: 0.5,
  };
};

function UmweltalarmMap({ loggedOut, initialised }) {
  const [gazData, setGazData] = useState([]);
  const [isFeatureCollectionVisible, setFeatureCollectionVisible] = useState(false);

  const [hits, setHits] = useState([]);
  const [featureCollection, setFeatureCollection] = useState([]);
  const { windowSize } = useContext(ResponsiveTopicMapContext);

  useEffect(() => {
    getData(setGazData);
  }, []);

  useEffect(() => {
    const features = [];
    for (const hit of hits || []) {
      const f = convertToFeature(hit);
      if (f) {
        features.push(f);
      }
    }
    setFeatureCollection(features);
  }, [hits]);
  console.log("featureCollection", featureCollection);
  console.log("hiots", hits);

  return (
    <div key={initialised != null ? initialised : "init"}>
      <Crosshair />
      <TopicMapComponent
        gazData={gazData}
        modalMenu={<MyMenu />}
        homeZoom={13}
        maxZoom={22}
        secondaryInfo={windowSize && <InfoPanel hits={hits} />}
        locatorControl={true}
        mappingBoundsChanged={(boundingBox) => {
          setHits(undefined);
          let bbox = [boundingBox.left, boundingBox.bottom, boundingBox.right, boundingBox.top];
          let bbPoly = bboxPolygon(bbox);
          //   console.log("xxx mappingBoundsChanged", center);
          let center = turfCenter(bbPoly);
          console.log("sss bbPoly", bbPoly);
          console.log("sss center", center);

          searchForFeatures(db, daqKeys, center).then((hits) => {
            setHits(hits);
          });
        }}
      >
        {!loggedOut && (
          <InfoBox
            isFeatureCollectionVisible={isFeatureCollectionVisible}
            setFeatureCollectionVisible={setFeatureCollectionVisible}
            hits={hits}
          />
        )}
        {isFeatureCollectionVisible && (
          <FeatureCollectionDisplay style={style} featureCollection={featureCollection} />
        )}
      </TopicMapComponent>
    </div>
  );
}

export default UmweltalarmMap;
