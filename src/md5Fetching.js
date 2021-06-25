import Dexie from 'dexie';
import Flatbush from 'flatbush';
import turf from 'turf';

export const CACHE_JWT = "--cached--data--";
export const OBJECT_TABLE_EXT = "_all_objects";

export const initTables = (prefix, daqKeys) => {
    var db = new Dexie(prefix);
    var schema = new Object();
    for (const key of daqKeys) {
        schema[key] = "++id, md5,data,time";
        schema[key + OBJECT_TABLE_EXT] = "id";
    }
    schema['index_table'] = "id,table,tabid";
    console.log(schema);
    db.version(5).stores(schema);

    return db;
}

export const md5ActionFetchDAQ4Dexie = async (prefix, apiUrl, jwt, daqKey, db) => {
    const cachePrefix = "@" + prefix + ".." + apiUrl + "." + daqKey;
    const md5Key = cachePrefix + ".md5";
    const dataKey = cachePrefix + ".data";
    const timeKey = cachePrefix + ".time";

    const allObjects = await db.table(daqKey).toArray();
    var md5InCache = null;

    if (allObjects[0] != null) {
        md5InCache = allObjects[0].md5;
    }
  
    console.log("DAQ for " + daqKey);

    let taskParameters = {
      parameters: {
        daqKey,
        md5: md5InCache || "-",
      },
    };
  
    let fd = new FormData();
    fd.append(
      "taskparams",
      new Blob([JSON.stringify(taskParameters)], {
        type: "application/json",
      })
    );
  
    if (jwt === CACHE_JWT) {
      const data = allObjects[0].data;
      
      //go for result.time after the new version of the action is live
      const time = allObjects[0].time;
      return new Promise((resolve, reject) => {
        resolve({ data, time });
      });
    } else {
      const response = await fetch(
        apiUrl + "/actions/WUNDA_BLAU.dataAquisition/tasks?resultingInstanceType=result",
        {
          method: "POST",
          // method: "GET",
          headers: {
            Authorization: "Bearer " + jwt,
            // "Content-Type": "application/json",
            // Accept: "application/json",
          },
          body: fd,
        }
      );
  
      if (response.status >= 200 && response.status < 300) {
        const content = await response.json();
        if (content.res) {
          try {
            const result = JSON.parse(content.res);
            let status = result.status;
            let data, time;
  
            if (status === 200) {
              console.log("DAQ cache miss for " + daqKey);
  
              data = JSON.parse(result.content);
              time = result.time;
              var newData = new Object();
              newData['md5'] = result.md5;
              newData['data'] = result.content;
              newData['time'] = time;
              console.log('new md5: ' + newData.md5);
              await db.table(daqKey).clear();
              await db.table(daqKey).add(newData);
              await indexGeometries(newData, daqKey, prefix, db);
            } else if (status === 304) {
              console.log("DAQ cache hit for " + daqKey);
              //go for result.time after the new version of the action is live

              if (allObjects[0] != null) {
                time = allObjects[0].time;
                data = JSON.parse(allObjects[0].data);
              }
            }
  
            return new Promise((resolve, reject) => {
              resolve({ data, time });
            });
          } catch (e) {
            return new Promise((resolve, reject) => {
              reject({
                status: 500,
                desc:
                  "error when parsing the server result. probably the content has the wrong structure",
                content,
                exception: e,
              });
            });
          }
        } else {
          return new Promise((resolve, reject) => {
            reject({
              status: 500,
              desc: "error when parsing the server result.",
              content,
            });
          });
        }
      } else if (response.status === 401) {
        return new Promise((resolve, reject) => {
          reject({ status: response.status, desc: "unauthorized" });
        });
      } else {
        return new Promise((resolve, reject) => {
          reject({ status: response.status, desc: "unknown" });
        });
      }
    }
  };
  

  export const indexGeometries = async (content, table, prefix, db) => {
    const index = new Flatbush(JSON.parse(content.data).length);
    const tableObject = db.table(table + OBJECT_TABLE_EXT);
    await tableObject.clear();

    for (const el of JSON.parse(content.data)) {
      const geo = getBoundsFromArea(el.geojson);
      var i = index.add(geo[0][1], geo[0][0], geo[1][1], geo[1][0]);
      var newData = new Object();
      newData['id'] = i;
      newData['data'] = JSON.stringify(el);
      await tableObject.add(newData);
    }

    index.finish();
    
    const allObjects = await db.table(table).toArray();
    var changes = new Object();
    changes['pol_index'] = index.data;
    await db.table(table).update(allObjects[0].id, changes);
  }


  export const getBoundsFromArea = (area) => {
    const bboxArray = turf.bbox(area);
    const corner1 = [bboxArray[1], bboxArray[0]];
    const corner2 = [bboxArray[3], bboxArray[2]];
    var bounds = [corner1, corner2];

    return bounds;
  }