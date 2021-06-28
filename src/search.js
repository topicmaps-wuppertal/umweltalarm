import Flatbush from 'flatbush';
import {getBoundsFromArea} from "./md5Fetching";
import booleanIntersects from "@turf/boolean-intersects";

export const nameMapping = new Object();
nameMapping['StoerfallBetriebeKlasse1']='betrieb';
nameMapping['StoerfallBetriebeKlasse2']='betrieb';
nameMapping['wasserverbaende']='name';
nameMapping['wasserschutzgebiete']='zone';
nameMapping['autobahnmeisterei']='bezirk';
nameMapping['landschaftsschutzgebiete']='sg_typ';
nameMapping['naturschutzgebiete']='sg_typ';
nameMapping['strassenmeisterei']='bezirk';
nameMapping['bimschNrw']='astnr';
nameMapping['bimschWuppertal']='astnr';
nameMapping['trinkwasserbrunnen']='str_name';
nameMapping['stadtFlurstuecke']='flurstueck';

export const searchForFeatures = async (db, daqKeys, geom) => {
    var hits = [];
    const geomBounds = getBoundsFromArea(geom);

    for (const key of daqKeys) {
        const metaTable = await db.table('daq_meta');

        if (metaTable) {
            const tableObjects = await metaTable.get({name: key});
            const otable  = await db.table(key);

            if (tableObjects) {
                var serIndex = tableObjects.pol_index;
                if (serIndex != null) {
                    const index = Flatbush.from(serIndex);
                    var indizes = index.search(geomBounds[0][1], geomBounds[0][0], geomBounds[1][1], geomBounds[1][0]);

                    if (indizes != null) {
                        for (var i of indizes) {
                            var o = await otable.get(i);

                            if (o != null) {
                                var obj = o.data;
                                obj['typ'] = key;
                                obj['default_name'] = obj[nameMapping[key]];
                                var geoj = obj.geojson;
                            

                                if (booleanIntersects(geoj, geom)) {
                                    hits.push(obj);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return hits;
}


export const offlineDataAvailable = async (db, daqKeys) => {
    var lastTime = null;

    for (const key of daqKeys) {
        const metaTable = await db.table('daq_meta');

        if (metaTable != null) {
            const tableObjects = await metaTable.get({name: key});

            if (tableObjects != null) {
                lastTime = tableObjects.time;
            } else {
                console.log('offline data for key ' + key + ' not available');
                return null;
            }
        }
    }

    return lastTime;
}