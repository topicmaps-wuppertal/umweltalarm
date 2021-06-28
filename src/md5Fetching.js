import Dexie from 'dexie';
import Flatbush from 'flatbush';
import turf from 'turf';

export const CACHE_JWT = "--cached--data--";

export const initTables = (prefix, daqKeys) => {
    var db = new Dexie(prefix);
    var schema = new Object();
    for (const key of daqKeys) {
        schema[key] = "gid";
    }
    schema['daq_meta'] = "++id,name,md5,time";
    db.version(7).stores(schema);

    return db;
}

export const md5ActionFetchDAQ4Dexie = async (prefix, apiUrl, jwt, daqKey, db) => {
    const cachePrefix = "@" + prefix + ".." + apiUrl + "." + daqKey;
    const md5Key = cachePrefix + ".md5";
    const dataKey = cachePrefix + ".data";
    const timeKey = cachePrefix + ".time";

    const allObjects = await db.table('daq_meta').get({name: daqKey});
    var md5InCache = null;

    if (allObjects != null) {
        md5InCache = allObjects.md5;
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
      const data = 'data retrieved';
      
      //go for result.time after the new version of the action is live
      const time = allObjects.time;
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
              newData['time'] = time;
              newData['name'] = daqKey;
              console.log('new md5: ' + newData.md5);

              if (allObjects != null) {
                await db.table('daq_meta').update(allObjects.id, newData);
              } else {
                db.table('daq_meta').add(newData);
              } 
//              console.time("index time"+daqKey)
              await indexGeometries(data, daqKey, prefix, db);
//              console.timeEnd("index time"+daqKey)
            } else if (status === 304) {
              console.log("DAQ cache hit for " + daqKey);
              //go for result.time after the new version of the action is live

              if (allObjects != null) {
                time = allObjects.time;
                data = 'data retrieved';
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
    const index = new Flatbush(content.length);
    const tableObject = db.table(table);
    await tableObject.clear();

    const data=[];

    for (const el of content) {
      const geo = getBoundsFromArea(el.geojson);
      var i = index.add(geo[0][1], geo[0][0], geo[1][1], geo[1][0]);
      var newData = new Object();
      newData['gid'] = i;
      newData['data'] = el;
      data.push(newData);
    }

    await tableObject.bulkPut(data);
    index.finish();
    
    const allObjects = await db.table('daq_meta').get({name: table});
    var changes = new Object();
    changes['pol_index'] = index.data;
    await db.table('daq_meta').update(allObjects.id, changes);
  }


  export const getBoundsFromArea = (area) => {
    const bboxArray = turf.bbox(area);
    const corner1 = [bboxArray[1], bboxArray[0]];
    const corner2 = [bboxArray[3], bboxArray[2]];
    var bounds = [corner1, corner2];

    return bounds;
  }