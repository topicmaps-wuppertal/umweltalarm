import React, { useContext } from "react";
import { FeatureCollectionContext } from "react-cismap/contexts/FeatureCollectionContextProvider";
import SecondaryInfoPanelSection from "react-cismap/topicmaps/SecondaryInfoPanelSection";
import SecondaryInfo from "react-cismap/topicmaps/SecondaryInfo";
import { TopicMapContext } from "react-cismap/contexts/TopicMapContextProvider";
import IconLink from "react-cismap/commons/IconLink";

const objectifyHits = (hits) => {
  const hitObject = {};

  const testAnsprechpartner = {
    organisation: "cismet GmbH",
    name: "Thorsten Hell",
    email: "th@cismet.de",
    telefon: "0681 965901 20",
    bemerkung: "nur zum testen",
  };
  if (hits) {
    for (const hit of hits) {
      hit.ansprechpartner = testAnsprechpartner;
      if (hitObject[hit.typ]) {
        hitObject[hit.typ].push(hit);
      } else {
        hitObject[hit.typ] = [hit];
      }
    }
  }
  return hitObject;
};

const getAnsprechpartnerLinks = (ansprechpartner) => {
  console.log("ansprechpartner", ansprechpartner);

  let links = [];
  if (ansprechpartner.telefon) {
    links.push(
      <span style={{ padding: 4 }}>
        <IconLink
          key={`IconLink.tel`}
          tooltip='Betreiber Anrufen'
          href={"tel:" + ansprechpartner.telefon}
          iconname='phone'
        />
      </span>
    );
  }
  if (ansprechpartner.email) {
    links.push(
      <span style={{ padding: 4 }}>
        <IconLink
          key={`IconLink.email`}
          tooltip='E-Mail an Betreiber schreiben'
          href={"mailto:" + ansprechpartner.email}
          iconname='envelope-square'
          target='_blank'
        />
      </span>
    );
  }
  if (ansprechpartner.url) {
    links.push(
      <span style={{ padding: 4 }}>
        <IconLink
          key={`IconLink.web`}
          tooltip='Betreiberwebseite'
          href={ansprechpartner.url}
          target='_blank'
          iconname='external-link-square'
        />
      </span>
    );
  }
  return links;
};

const InfoPanel = ({ hits }) => {
  const { history } = useContext(TopicMapContext);
  const lat = new URLSearchParams(history.location.search).get("lat");
  const long = new URLSearchParams(history.location.search).get("lng");
  const showRawData = new URLSearchParams(history.location.search).get("showRawData") !== null;

  const hitObject = objectifyHits(hits);

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

    if (hits !== undefined) {
      if (hitObject.strassenmeisterei || hitObject.autobahnmeisterei) {
        subSections.push(
          <SecondaryInfoPanelSection key='standort' bsStyle='success' header={"Straßen"}>
            {/* Immer nur 1 möglich */}

            {hitObject.strassenmeisterei && (
              <div>
                <div
                  style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                    float: "right",
                    paddingBottom: "5px",
                  }}
                >
                  {getAnsprechpartnerLinks(hitObject.strassenmeisterei[0].ansprechpartner)}
                </div>
                <div
                  style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                    float: "right",
                    paddingBottom: "5px",
                  }}
                ></div>

                <div>
                  <b>zuständige Straßenmeisterei: </b>
                  {hitObject.strassenmeisterei[0].default_name}
                </div>
              </div>
            )}

            <br></br>
            <br></br>
            {/* mehrere möglich*/}
            {hitObject.autobahnmeisterei &&
              hitObject.autobahnmeisterei.map((value, index) => {
                return (
                  <div>
                    <b>zuständige Autobahnmeisterei: </b>
                    {value.default_name}
                  </div>
                );
              })}
          </SecondaryInfoPanelSection>
        );
      }
      if (showRawData) {
        //remove the geometries
        const hitsForRawDisplay = JSON.parse(JSON.stringify(hits));

        for (const hit of hitsForRawDisplay) {
          delete hit.geojson;
        }

        const hitObjectForRawDisplay = objectifyHits(hitsForRawDisplay);

        subSections.push(
          <SecondaryInfoPanelSection
            key='standort'
            bsStyle='info'
            header={"Trefferobjekte (Raw Data ohne Geometrie): " + hits.length + " Treffer"}
          >
            <div style={{ fontSize: "115%", padding: "10px", paddingTop: "0px" }}>
              <pre key='hitObject'>{JSON.stringify(hitObjectForRawDisplay, null, 2)}</pre>
              {/* <pre key='hits'>{JSON.stringify(hitsForRawDisplay, null, 2)}</pre> */}
            </div>
          </SecondaryInfoPanelSection>
        );
      }
    }
    return (
      <SecondaryInfo
        titleIconName='info-circle'
        title={
          "Datenblatt zu: " +
          Math.round(lat * 10000) / 10000 +
          ", " +
          Math.round(long * 1000) / 1000
        }
        mainSection={
          <div style={{ fontSize: "115%", padding: "10px", paddingTop: "0px" }}>
            <div>
              Die Suche an der angegebene Position hat insgesamt {hits.length} Treffer ergeben:
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
