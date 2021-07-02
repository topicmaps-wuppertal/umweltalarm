import React, { useContext } from "react";
import { FeatureCollectionContext } from "react-cismap/contexts/FeatureCollectionContextProvider";
import SecondaryInfoPanelSection from "react-cismap/topicmaps/SecondaryInfoPanelSection";
import SecondaryInfo from "react-cismap/topicmaps/SecondaryInfo";
const InfoPanel = ({ hits }) => {

  if (hits !== undefined) {
    const subSections = [];

    const display = (desc, value, valFunc) => {
      if (value && valFunc === undefined && Array.isArray(value) === false) {
        return (
          <div>
            <b>{desc}:</b> {value}
          </div>
        );
      } else if (value && valFunc === undefined && Array.isArray(value) === true) {
        return (
          <div>
            <b>{desc}:</b> {value.join(", ")}
          </div>
        );
      } else if (value && valFunc !== undefined) {
        return (
          <div>
            <b>{desc}:</b> {valFunc(value)}
          </div>
        );
      }
    };

    const showRawData = new URLSearchParams(window.location.href).get("showRawData");
    if (hits !== undefined) {
      subSections.push(
        <SecondaryInfoPanelSection
          key='standort'
          bsStyle='info'
          header={"Umweltalarm (raw data): " + hits.length + ' Treffer'}
        >
          <div style={{ fontSize: "115%", padding: "10px", paddingTop: "0px" }}>
            <pre>{JSON.stringify(hits, null, 2)}</pre>
          </div>
        </SecondaryInfoPanelSection>
      );
    }
    return (
      <SecondaryInfo
        titleIconName='info-circle'
        title={"Datenblatt: " }
        mainSection={
          <div style={{ fontSize: "115%", padding: "10px", paddingTop: "0px" }}>
            <div>
              {display("Nummer", hits?.nummer)}
              {display("Bezeichnung", hits?.bezeichnung)}
              {display("Flächengröße", hits?.groesse, (a) => (
                <span>
                  {a.toLocaleString()} m² (circa{" "}
                  {(Math.round((a / 10000) * 10) / 10).toLocaleString()} ha)
                </span>
              ))}
              {display("Stadtbezirk(e)", hits?.stadtbezirke, (sb) => sb.join(", "))}
              {display("Quartier(e)", hits?.quartiere, (q) => q.join(", "))}
              {display("Eigentümer", hits?.eigentuemer, (e) => e.join(", "))}
            </div>
          </div>
        }
        subSections={subSections}
      />
    );
  } else {
    return null;
  }
};
export default InfoPanel;
