const hubspot = require('@hubspot/api-client');
const {get, post} = require("axios");

exports.main = async (context = {}) => {

  const {hs_object_id} = context.propertiesToSend;

  if (context.parameters) {
    if (context.parameters.target === 'amanda_get_calepinage') {
      const amandaData = await getCalepinageData(hs_object_id);
      return {amandaData};
    }
    if (context.parameters.target === 'amanda_add_calepinage') {
      const amandaData = await addCalepinageData(hs_object_id);
      return {amandaData};
    }
  }
  return {};
};

async function addCalepinageData(hs_object_id) {
  // const res = await get(`https://dev3-api.tenergie.fr/v2/hubspot/calepinage?hubspot_id=${hs_object_id}`,{
  //   headers: {
  //     'accept': '*/*', 'X-Authorization': 'bcd6D306-e24t-1235-tv68-6b9c-5904'
  //   },
  // }).then(response => {
  //   return response.data;
  // })

  return [{'project': 'Projet 12', 'link': '#12 '}, {
    'project': 'Projet 58', 'link': '#58'
  }]
}

async function getCalepinageData(hs_object_id) {
  const res = await get(`https://dev3-api.tenergie.fr/v2/hubspot/calepinage?hubspot_id=${hs_object_id}`,{
    headers: {
      'accept': '*/*', 'X-Authorization': 'bcd6D306-e24t-1235-tv68-6b9c-5904'
    },
  }).then(response => {
    return response.data;
  })

  return res
}
