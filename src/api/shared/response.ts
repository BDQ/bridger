export const success = {
  statusCode: "200",
  headers: {
    "Access-Control-Allow-Origin": "*"
  }
};

export const failure = {
  ...success,
  statusCode: "500"
};
