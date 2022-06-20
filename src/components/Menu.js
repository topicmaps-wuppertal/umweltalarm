import { getSimpleHelpForTM } from "react-cismap/tools/uiHelper";
import ConfigurableDocBlocks from "react-cismap/topicmaps/ConfigurableDocBlocks";
import DefaultSettingsPanel from "react-cismap/topicmaps/menu/DefaultSettingsPanel";
import ModalApplicationMenu from "react-cismap/topicmaps/menu/ModalApplicationMenu";
import Section from "react-cismap/topicmaps/menu/Section";
import MenuFooter from "./MenuFooter";
import Ueberblick from "./onlinehelpsections/010_Ueberblick";
import Fachdatenquellen from "./onlinehelpsections/020_Fachdatenquellen";
import Hintergrundkarten from "./onlinehelpsections/030_Hintergrundkarte";
import ThematischerDurchstich from "./onlinehelpsections/040_ThematischerDurchstich";
import Infobox from "./onlinehelpsections/050_Infobox";
import InKartePositionieren from "./onlinehelpsections/060_InKartePositionieren";
import MeinStandort from "./onlinehelpsections/070_MeinStandort";
import ObjekteSuchen from "./onlinehelpsections/080_ObjekteSuchen";
import AnmeldungUndOfflineBenutzung from "./onlinehelpsections/090_AnmeldungUndOfflineBenutzung";

const MyMenu = () => {
  const simpleHelp = undefined;
  return (
    <ModalApplicationMenu
      menuIcon={"bars"}
      menuTitle={"Einstellungen, Legende und Kompaktanleitung"}
      menuIntroduction={
        <span>
          Über <strong>Einstellungen</strong> können Sie die Darstellung der Hintergrundkarte und
          der Objekte an Ihre Vorlieben anpassen. Im Abschnitt{" "}
          <strong>Legende der Fachdaten</strong> finden Sie die Zeichenerklärung für diejenigen
          Fachdaten, die flächendeckend als Bestandteil der Hintergrundkarte angeboten werden
          (Gewässer- und Kanalnetz, Trinkwasserbrunnen). Wählen Sie{" "}
          <strong>Kompaktanleitung</strong> für detailliertere Bedienungsinformationen.
        </span>
      }
      menuSections={[
        <DefaultSettingsPanel
          key='settings'
          skipFilterTitleSettings={true}
          skipClusteringSettings={true}
          skipSymbolsizeSetting={true}
          previewMapPosition='lat=51.26237138174926&lng=7.236986160278321&zoom=16'
        />,
        <Section
          key='legend'
          sectionKey='legend'
          sectionTitle='Legende der Fachdaten'
          sectionBsStyle='info'
          sectionContent={
            <div>
              <ul style={{ listStyleType: "none" }}>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Wupperverband.png"}
                  ></img>
                  Gewässer Wupperverband
                </li>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_BRWasserverband.png"}
                  ></img>
                  Gewässer Bergisch-Rheinischer Wasserverband / Ruhrverband
                </li>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Verrohrung.png"}
                  ></img>
                  Gewässerverrohrungen
                </li>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Schmutzkanal.png"}
                  ></img>
                  Schmutzwasserkanal
                </li>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Regenkanal.png"}
                  ></img>
                  Regenwasserkanal
                </li>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Mischkanal.png"}
                  ></img>
                  Mischwasserkanal
                </li>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Privatkanal.png"}
                  ></img>
                  Privatkanal
                </li>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Fliessrichtung.png"}
                  ></img>
                  Fließrichtungspfeil (jeweils in der Farbe des zugehörigen Kanalnetzes)
                </li>
                <li>
                  <img
                    style={{ padding: 5, marginRight: 15 }}
                    width='50px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Schachtdeckel.png"}
                  ></img>
                  Schachtdeckel (jeweils in der Farbe des zugehörigen Kanalnetzes)
                </li>
                <li>
                  <img
                    style={{ padding: 5, margin: 10, marginRight: 24, marginTop: 10 }}
                    width='30px'
                    alt='Legendenbild'
                    src={process.env.PUBLIC_URL + "/images/Legende_Trinkwasserbrunnen.png"}
                  ></img>
                  Trinkwasserbrunnen
                </li>
              </ul>
            </div>
          }
        />,
        <Section
          key='help'
          sectionKey='help'
          sectionTitle='Kompaktanleitung'
          sectionBsStyle='default'
          sectionContent={
            <ConfigurableDocBlocks
              configs={[
                {
                  type: "FAQS",
                  configs: [
                    {
                      title: "Überblick",
                      bsStyle: "secondary",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <Ueberblick />,
                      },
                    },
                    {
                      title: "Fachdatenquellen",
                      bsStyle: "secondary",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <Fachdatenquellen />,
                      },
                    },
                    {
                      title: "Hintergrundkarte",
                      bsStyle: "secondary",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <Hintergrundkarten />,
                      },
                    },
                    {
                      title: "Karteninhalt verschieben und thematischer Durchstich",
                      bsStyle: "success",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <ThematischerDurchstich />,
                      },
                    },
                    {
                      title: "Info-Box und Datenblattansicht",
                      bsStyle: "success",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <Infobox />,
                      },
                    },
                    {
                      title: "In Karte positionieren",
                      bsStyle: "success",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <InKartePositionieren />,
                      },
                    },
                    {
                      title: "Mein Standort",
                      bsStyle: "success",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <MeinStandort />,
                      },
                    },
                    {
                      title: "Objekte im Kartenfenster suchen",
                      bsStyle: "warning",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <ObjekteSuchen />,
                      },
                    },
                    {
                      title: "Anmeldung und Offline-Benutzung",
                      bsStyle: "warning",
                      contentBlockConf: {
                        type: "REACTCOMP",
                        content: <AnmeldungUndOfflineBenutzung />,
                      },
                    },
                  ],
                },
              ]}
            />
          }
        />,
      ]}
      menuFooter={<MenuFooter />}
    />
  );
};
export default MyMenu;
