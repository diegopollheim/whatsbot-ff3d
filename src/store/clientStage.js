let clients = {};

function getStageClient(from) {
  let client = clients[from];

 return client
}

function setStageClient(from, stage) {
  clients[from] = {
    stage: stage,
  };
}
function removeClientStage(from) {
  clients[from] = null
}

module.exports = {
  getStageClient,
  setStageClient,
  removeClientStage
};
