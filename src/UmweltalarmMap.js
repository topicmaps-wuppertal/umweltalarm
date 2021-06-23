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

const host = "https://wupp-topicmaps-data.cismet.de";

const getData = async (setGazData, setInfoData) => {
  const prefix = "GazDataForStories";
  const sources = {};
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

  const ns = await md5FetchJSON(prefix, host + "/data/3857/naturschutzgebiete.json");
  const ls = await md5FetchJSON(prefix, host + "/data/3857/landschaftsschutzgebiete.json");
  for (const f of ns) {
    f.crs = {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:EPSG::25832",
      },
    };
  }
  for (const f of ls) {
    f.crs = {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:EPSG::25832",
      },
    };
  }
  setInfoData([ns, ls]);
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
          setHits([]);
          let bbox = [boundingBox.left, boundingBox.bottom, boundingBox.right, boundingBox.top];
          let bbPoly = bboxPolygon(bbox);
          let center = turfCenter(bbPoly);
          //   console.log("xxx mappingBoundsChanged", center);
          const hits = [];
          for (const infodataSet of infoData) {
            // console.log("infodataSet", infodataSet);
            // console.log("infodataSetLength", infodataSet.length);

            for (const feature of infodataSet) {
              if (booleanIntersects(feature, center)) {
                hits.push(feature);
                console.log("xxx hit", feature.properties.SG_TYP);
              }
            }
          }
          setHits(hits);
        }}
      >
        <ResponsiveInfoBox
          //   panelClick={panelClick}
          header={
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      textAlign: "left",
                      verticalAlign: "top",
                      background: "grey",
                      color: "black",
                      opacity: "0.9",
                      paddingLeft: "3px",
                      paddingTop: "0px",
                      paddingBottom: "0px",
                    }}
                  >
                    <span>Umweltalarm</span>
                  </td>
                </tr>
              </tbody>{" "}
            </table>
          }
          pixelwidth={300}
          //   collapsedInfoBox={collapsedInfoBox}
          //   setCollapsedInfoBox={setCollapsedInfoBox}
          isCollapsible={false}
          //   handleResponsiveDesign={handleResponsiveDesign}
          //   infoStyle={infoStyle}
          //   secondaryInfoBoxElements={secondaryInfoBoxElements}
          alwaysVisibleDiv={<span>Analyseergebnis ({hits.length})</span>}
          collapsibleDiv={
            <div>
              {hits.length === 0 && <span>keine Besonderheiten</span>}
              {hits.length > 0 && (
                <div>
                  es wurden folgende Treffer gefunden:
                  {hits.map((entry, index) => {
                    return <div key={index}>{entry.properties.SG_TYP}</div>;
                  })}
                </div>
              )}
            </div>
          }
          fixedRow={true}
        />
      </TopicMapComponent>
    </div>
  );
}

export default UmweltalarmMap;
