import ResponsiveInfoBox from "react-cismap/topicmaps/ResponsiveInfoBox";
import { useContext } from "react";
import { UIContext, UIDispatchContext } from "react-cismap/contexts/UIContextProvider";
import IconComp from "react-cismap/commons/Icon";
import {
  faArchive,
  faBiohazard,
  faCity,
  faFaucet,
  faHandHoldingWater,
  faIndustry,
  faLeaf,
  faRoad,
  faWater,
  faTree,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "react-fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Loadable from "react-loading-overlay";

const InfoBox = ({ hits }) => {
  const { collapsedInfoBox } = useContext(UIContext);
  const { setCollapsedInfoBox, setSecondaryInfoVisible } = useContext(UIDispatchContext);
  var hitsObject = {};

  if (Array.isArray(hits)) {
    for (var el of hits) {
      switch (el.typ) {
        case "trinkwasserbrunnen":
          if (hitsObject.brunnen === undefined) {
            hitsObject.brunnen = [];
          }
          hitsObject.brunnen.push(el);
          break;
        case "bimschNrw":
        case "bimschWuppertal":
          if (hitsObject.bimsch === undefined) {
            hitsObject.bimsch = [];
          }
          hitsObject.bimsch.push(el);
          break;
        case "strassenmeisterei":
          if (hitsObject.strassenmeisterei === undefined) {
            hitsObject.strassenmeisterei = [];
          }
          hitsObject.strassenmeisterei.push(el);
          break;
        case "naturschutzgebiete":
        case "landschaftsschutzgebiete":
          if (hitsObject.schutzgebiete === undefined) {
            hitsObject.schutzgebiete = [];
          }
          hitsObject.schutzgebiete.push(el);
          break;
        case "autobahnmeisterei":
          if (hitsObject.autobahnmeisterei === undefined) {
            hitsObject.autobahnmeisterei = [];
          }
          hitsObject.autobahnmeisterei.push(el);
          break;
        case "wasserschutzgebiete":
          if (hitsObject.wasserschutzgebiete === undefined) {
            hitsObject.wasserschutzgebiete = [];
          }
          hitsObject.wasserschutzgebiete.push(el);
          break;
        case "wasserverbaende":
          if (hitsObject.verbaende === undefined) {
            hitsObject.verbaende = [];
          }
          hitsObject.verbaende.push(el);
          break;
        case "StoerfallBetriebeKlasse1":
        case "StoerfallBetriebeKlasse2":
          if (hitsObject.stoerfallbetriebe === undefined) {
            hitsObject.stoerfallbetriebe = [];
          }
          hitsObject.stoerfallbetriebe.push(el);
          break;
        case "stadtFlurstuecke":
          if (hitsObject.stadtFlurstuecke === undefined) {
            hitsObject.stadtFlurstuecke = [];
          }
          hitsObject.stadtFlurstuecke.push(el);
          break;
      }
    }
  }

  const header = (
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
              paddingLeft: "0px",
              paddingTop: "0px",
              paddingBottom: "0px",
            }}
          >
            <span> Analyseergebnis: ({Array.isArray(hits) ? hits.length : "-"})</span>
          </td>
        </tr>
      </tbody>
    </table>
  );

  let fontSize = 30;
  let activeStyle = { border: 0, borderStyle: "solid", fontSize, textAlign: "center", flexGrow: 1 };
  let inactiveStyle = {
    border: 0,
    borderStyle: "solid",
    fontSize,
    textAlign: "center",
    color: "#dddddd",
    flexGrow: 1,
  };
  let subtextStyle = { fontSize: 12, minHeight: "18px" };

  let gridStyle = {
    display: "grid",
    gridGap: "5px",
    gridTemplateColumns: "repeat(3, 1fr)",
    verticalAlign: "center",
  };
  if (collapsedInfoBox === true) {
    fontSize = 23;
    subtextStyle = { fontSize: 9, minHeight: "15px" };
    gridStyle = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "nowrap",
      justifyContent: "center",
      verticalAlign: "center",
      alignContent: "space-around",
    };
  }

  let symbols = (
    <div
      style={{ paddingRight: 9 }}
      onClick={() => {
        setSecondaryInfoVisible(true);
      }}
    >
      <Loadable active={hits === undefined} spinner text={"Suchen"}>
        <div style={gridStyle}>
          {/* Trinkwasserbrunnen */}
          <div style={hitsObject?.brunnen !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faFaucet} />
            <div style={subtextStyle}>
              {hitsObject?.brunnen !== undefined
                ? "Abstand " + hitsObject?.brunnen[0].abstand + " m"
                : ""}
            </div>
          </div>
          {/* Autobahnmeisterei */}
          {/* <div style={hitsObject?.autobahnmeisterei !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faRoad} />
            <div style={subtextStyle}>{(hitsObject?.autobahnmeisterei !== undefined ? hitsObject?.autobahnmeisterei[0].default_name : '')}</div>
          </div> */}
          {/* Straßenmeisterei */}
          {/* <div style={hitsObject?.strassenmeisterei !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faRoad} />
            <div style={subtextStyle}>{(hitsObject?.strassenmeisterei !== undefined ? hitsObject?.strassenmeisterei[0].default_name : '')}</div>
          </div> */}
          {/* BIMSchG */}
          <div style={hitsObject?.bimsch !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faIndustry} />
            <div style={subtextStyle}>
              {hitsObject?.bimsch !== undefined
                ? (hitsObject?.bimsch[0].typ === "bimschNrw" ? "BRD - " : "UIB - ") +
                  hitsObject?.bimsch[0].abstand +
                  " m"
                : ""}
            </div>
          </div>
          {/* Wasserschutzgebiete */}
          <div style={hitsObject?.wasserschutzgebiete !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faHandHoldingWater} />
            <div style={subtextStyle}>
              {hitsObject?.wasserschutzgebiete !== undefined
                ? hitsObject?.wasserschutzgebiete[0].default_name
                : ""}
            </div>
          </div>
          {/* Verbände */}
          {/* <div style={hitsObject?.verbaende !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faWater} />
            <div style={subtextStyle}>
              {hitsObject?.verbaende !== undefined ? hitsObject?.verbaende[0].default_name : ""}
            </div>
          </div> */}
          {/* Störfallbetriebe */}
          <div style={hitsObject?.stoerfallbetriebe !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faExclamationCircle} />
            <div style={subtextStyle}>
              {hitsObject?.stoerfallbetriebe !== undefined
                ? hitsObject?.stoerfallbetriebe[0].default_name
                : ""}
            </div>
          </div>
          {/* städt. Flurstücke */}
          <div style={hitsObject?.stadtFlurstuecke !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faCity} />
            <div style={subtextStyle}>
              {hitsObject?.stadtFlurstuecke !== undefined
                ? hitsObject?.stadtFlurstuecke[0].default_name
                : ""}
            </div>
          </div>
          {/* Landschafts und Naturschutzgebiete */}
          <div style={hitsObject?.schutzgebiete !== undefined ? activeStyle : inactiveStyle}>
            <FontAwesomeIcon style={{ fontSize }} icon={faTree} />
            <div style={subtextStyle}>
              {hitsObject?.schutzgebiete !== undefined
                ? hitsObject?.schutzgebiete[0].default_name
                : ""}
            </div>
          </div>
        </div>
      </Loadable>
    </div>
  );
  return (
    <ResponsiveInfoBox
      panelClick={() => {}}
      pixelwidth={300}
      header={header}
      collapsedInfoBox={collapsedInfoBox}
      setCollapsedInfoBox={setCollapsedInfoBox}
      isCollapsible={true}
      handleResponsiveDesign={true}
      infoStyle={{ padding: "0px" }}
      secondaryInfoBoxElements={undefined}
      alwaysVisibleDiv={collapsedInfoBox ? symbols : <div />}
      collapsibleDiv={!collapsedInfoBox ? symbols : <div />}
      fixedRow={true}
    />
  );
};
export default InfoBox;
