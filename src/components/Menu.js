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
