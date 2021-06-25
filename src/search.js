import Flatbush from 'flatbush';
import {getBoundsFromArea, OBJECT_TABLE_EXT} from "./md5Fetching";
import booleanIntersects from "@turf/boolean-intersects";


export const searchForFeatures = async (db, daqKeys, geom) => {
    const geomBounds = getBoundsFromArea(geom);
    var hits = [];

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