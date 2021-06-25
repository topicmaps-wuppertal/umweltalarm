import Flatbush from 'flatbush';
import {getBoundsFromArea, OBJECT_TABLE_EXT} from "./md5Fetching";
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
        const tableObjects = await db.table(key).toArray();
        const otable  = await db.table(key + OBJECT_TABLE_EXT);

        if (tableObjects[0] != null) {
            var serIndex = tableObjects[0].pol_index;
            if (serIndex != null) {
                const index = Flatbush.from(serIndex);
                var indizes = index.search(geomBounds[0][1], geomBounds[0][0], geomBounds[1][1], geomBounds[1][0]);

                if (indizes != null) {
                    for (var i of indizes) {
                        var o = await otable.get(i);
                        var obj = JSON.parse(o.data);
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

    return hits;
}


export const offlineDataAvailable = async (db, daqKeys) => {
    var lastTime = null;

    for (const key of daqKeys) {
        const tableObjects = await db.table(key).toArray();

        if (tableObjects[0] != null) {
            lastTime = tableObjects[0].time;
        } else {
            console.log('offline data for key ' + key + ' not available');
            return null;
        }
    }

    return lastTime;
}