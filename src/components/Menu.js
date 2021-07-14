import { useContext } from "react";
import { UIDispatchContext } from "react-cismap/contexts/UIContextProvider";
import { getSimpleHelpForTM } from "react-cismap/tools/uiHelper";
import ConfigurableDocBlocks from "react-cismap/topicmaps/ConfigurableDocBlocks";
import DefaultSettingsPanel from "react-cismap/topicmaps/menu/DefaultSettingsPanel";
import ModalApplicationMenu from "react-cismap/topicmaps/menu/ModalApplicationMenu";
import Section from "react-cismap/topicmaps/menu/Section";
import MenuFooter from "./MenuFooter";

const MyMenu = () => {
  const { setAppMenuActiveMenuSection } = useContext(UIDispatchContext);
  const simpleHelp = undefined;
  return (
    <ModalApplicationMenu
      menuIcon={"bars"}
      menuTitle={"Einstellungen und Kompaktanleitung"}
      menuIntroduction={
        <span>
          Über <strong>Einstellungen</strong> können Sie die Darstellung der Hintergrundkarte und
          der Objekte an Ihre Vorlieben anpassen. Wählen Sie <strong>Kompaktanleitung</strong> für
          detailliertere Bedienungsinformationen.enungsinformationen.
        </span>
      }
      menuSections={[
        <DefaultSettingsPanel
          key='settings'
          skipFilterTitleSettings={true}
          skipClusteringSettings={true}
          skipSymbolsizeSetting={true}
        />,
        <Section
          key='legend'
          sectionKey='legend'
          sectionTitle='Legende der Fachdaten'
          sectionBsStyle='info'
          sectionContent={
            <div>
              <ul>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_Wupperverband.png'
                  ></img>
                  Gewässer Wupperverband
                </li>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_BRWasserverband.png'
                  ></img>
                  Gewässer Bergisch-Rheinischer Wasserverband / Ruhrverband
                </li>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_Verrohrung.png'
                  ></img>
                  Gewässerverrohrungen
                </li>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_Schmutzkanal.png'
                  ></img>
                  Schmutzwasserkanal
                </li>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_Regenkanal.png'
                  ></img>
                  Regenwasserkanal
                </li>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_Mischkanal.png'
                  ></img>
                  Mischwasserkanal
                </li>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_Privatkanal.png'
                  ></img>
                  Privatkanal
                </li>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_Schachtdeckel.png'
                  ></img>
                  Schachtdeckel
                </li>
                <li>
                  <img
                    style={{ padding: 5 }}
                    width='50px'
                    alt='Legendenbild'
                    src='/images/Legende_Trinkwasserbrunnen.png'
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
            <ConfigurableDocBlocks configs={getSimpleHelpForTM(document.title, simpleHelp)} />
          }
        />,
      ]}
      menuFooter={<MenuFooter />}
    />
  );
};
export default MyMenu;
