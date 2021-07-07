import Flatbush from 'flatbush';
import {getBoundsFromArea} from "./md5Fetching";
import booleanIntersects from "@turf/boolean-intersects";
import turfDistance from "@turf/distance";
import turfCenter from "@turf/center";
import proj4 from "proj4";

export const nameMapping = {};
nameMapping['StoerfallBetriebeKlasse1']='betrieb';
nameMapping['StoerfallBetriebeKlasse2']='betrieb';
nameMapping['wasserverbaende']='name';
nameMapping['wasserschutzgebiete']='zone';
nameMapping['autobahnmeisterei']='bezirk';
nameMapping['landschaftsschutzgebiete']='sg_typ';
nameMapping['naturschutzgebiete']='sg_nummer';
nameMapping['strassenmeisterei']='bezirk';
nameMapping['bimschNrw']='astnr';
nameMapping['bimschWuppertal']='astnr';
nameMapping['trinkwasserbrunnen']='str_name';
nameMapping['stadtFlurstuecke']='flurstueck';

export const daqTableMapping = {};
daqTableMapping['StoerfallBetriebeKlasse1']='stoerfallbetriebe_klasse1';
daqTableMapping['StoerfallBetriebeKlasse2']='stoerfallbetriebe_klasse2';
daqTableMapping['wasserverbaende']='wasserverbaende';
daqTableMapping['wasserschutzgebiete']='wasserschutzgebiete';
daqTableMapping['autobahnmeisterei']='autobahnmeisterei';
daqTableMapping['landschaftsschutzgebiete']='landschaftsschutzgebiete';
daqTableMapping['naturschutzgebiete']='sg_naturschutzgebietetyp';
daqTableMapping['strassenmeisterei']='strassenmeisterei';
daqTableMapping['bimschNrw']='bimsch_nrw';
daqTableMapping['bimschWuppertal']='bimsch_wuppertal';
daqTableMapping['trinkwasserbrunnen']='trinkwasserbrunnen';
daqTableMapping['stadtFlurstuecke']='stadt_flurstuecke';

export const searchForFeatures = async (db, daqKeys, geom) => {
    var hits = [];
    const geomBounds = getBoundsFromArea(geom);
    var ansprechpartner = db.table('anprechp');
    var ansprechpartnerZustaendigkeit = db.table('zustaendigkeit');
    var trinkwasserbrunnen = null;
    var trinkwasserbrunnenDist = null;
    var bimsch = null;
    var bimschDist = null;
    var allBimsch = [];
    var allTrinkwasserbrunnen = [];

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
                                    if (key === 'trinkwasserbrunnen') {
                                        var distanceInMeters = getDistance(geom, geoj);
                                        addAnsprechpartner(key, obj, ansprechpartner, ansprechpartnerZustaendigkeit)
                                        obj['abstand'] = Math.round(distanceInMeters);

                                        if (trinkwasserbrunnenDist === null || trinkwasserbrunnenDist > distanceInMeters) {
                                            if (trinkwasserbrunnen !== null) {
                                                allTrinkwasserbrunnen.push(trinkwasserbrunnen);
                                            }
                                            trinkwasserbrunnen = obj;
                                            trinkwasserbrunnenDist = distanceInMeters;
                                        } else {
                                            allTrinkwasserbrunnen.push(obj);
                                        }
                                    } else if (key === 'bimschNrw' || key === 'bimschWuppertal') {
                                        distanceInMeters = getDistance(geom, geoj);
                                        addAnsprechpartner(key, obj, ansprechpartner, ansprechpartnerZustaendigkeit)
                                        obj['abstand'] = Math.round(distanceInMeters);

                                        if (bimschDist === null || bimschDist > distanceInMeters) {
                                            if (bimsch !== null) {
                                                allBimsch.push(bimsch);
                                            }
                                            bimsch = obj;
                                            bimschDist = distanceInMeters;
                                        } else {
                                            allBimsch.push(obj);
                                        }
                                    } else {
                                        addAnsprechpartner(key, obj, ansprechpartner, ansprechpartnerZustaendigkeit)
                                        hits.push(obj);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (trinkwasserbrunnen !== null) {
        hits.push(trinkwasserbrunnen);
        Array.prototype.push.apply(hits, allTrinkwasserbrunnen);
    } 

    if (bimsch !== null) {
        hits.push(bimsch);
        Array.prototype.push.apply(hits, allBimsch);
    }

    return hits;
}

export const getDistance = (geom, geojson) => {
    var geomCoords = [geom.geometry.coordinates[0], geom.geometry.coordinates[1]];
    var transformedGeom = proj4(proj4.defs("EPSG:3857"), proj4.defs("EPSG:4326"), geomCoords);
    var brunnenCenter = turfCenter(geojson);
    var brunnenCoords = [brunnenCenter.geometry.coordinates[0], brunnenCenter.geometry.coordinates[1]];
    var transformedBrunnen = proj4(proj4.defs("EPSG:3857"), proj4.defs("EPSG:4326"), brunnenCoords);
    var dist = turfDistance(transformedGeom, transformedBrunnen, {unit: 'kilometers'});
    var distanceInMeters = dist * 1000 * 1.6;

    return distanceInMeters;
}

export const addAnsprechpartner = async (daqKey, dataObject, ansprechpartner, ansprechpartnerZustaendigkeit) => {
    var table = daqTableMapping[daqKey];
    var keys = Object.keys(dataObject);
    var found = false;

    for (const key of keys) {
        if (key !== 'geojson' && dataObject[key] != undefined) {
            var anprechreferenz = await ansprechpartnerZustaendigkeit.get({tabelle: table, referenz: dataObject[key], referenzfeld: key});
            
            if (anprechreferenz) {
                var anspr = await ansprechpartner.get({id: '' + anprechreferenz.data.ansprechpartner});

                if (anspr) {
                    removeNullValues(anspr.data);
                    dataObject['Anprechpartner'] = anspr.data;
                    found = true;
                }
                break;
            }
        }
    }

    if (found === false) {
        var anprechreferenz = await ansprechpartnerZustaendigkeit.get({tabelle: table, referenz: 'null', referenzfeld: 'null'});

        if (anprechreferenz) {
            var anspr = await ansprechpartner.get({id: '' + anprechreferenz.data.ansprechpartner});
            
            if (anspr) {
                removeNullValues(anspr.data);
                dataObject['Anprechpartner'] = anspr.data;
            }
        }
    }

    return dataObject;
}

export const removeNullValues = (obj) => {
    var keys = Object.keys(obj);

    for (const key of keys) {
        if (obj[key] === null) {
            obj[key] = undefined;
        }
    }
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