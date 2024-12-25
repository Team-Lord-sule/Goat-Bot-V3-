const { db, utils, GoatBot } = global;
const { config } = GoatBot;
const { log, getText } = utils;
const { creatingThreadData, creatingUserData } = global.client.database;

module.exports = async function (usersData, threadsData, event) {
  const { threadID, senderID = event.senderID || event.author || event.userID } = event;

  // Check Thread Data
  if (threadID && !global.temp.createThreadDataError.includes(threadID)) {
    try {
      const findInCreatingThreadData = creatingThreadData.find(t => t.threadID === threadID);
      if (!findInCreatingThreadData) {
        if (!global.db.allThreadData.some(t => t.threadID === threadID)) {
          const threadData = await threadsData.create(threadID);
          log.info("DATABASE", `New Thread: ${threadID} | ${threadData.threadName} | ${config.database.type}`);
        }
      } else {
        await findInCreatingThreadData.promise;
      }
    } catch (err) {
      if (err.name !== "DATA_ALREADY_EXISTS") {
        global.temp.createThreadDataError.push(threadID);
        log.err("DATABASE", getText("handlerCheckData", "cantCreateThread", threadID), err);
      }
    }
  }

  // Check User Data
  if (senderID) {
    try {
      const findInCreatingUserData = creatingUserData.find(u => u.userID === senderID);
      if (!findInCreatingUserData) {
        if (!db.allUserData.some(u => u.userID === senderID)) {
          const userData = await usersData.create(senderID);
          log.info("DATABASE", `New User: ${senderID} | ${userData.name} | ${config.database.type}`);
        }
      } else {
        await findInCreatingUserData.promise;
      }
    } catch (err) {
      if (err.name !== "DATA_ALREADY_EXISTS") {
        log.err("DATABASE", getText("handlerCheckData", "cantCreateUser", senderID), err);
      }
    }
  }
};
