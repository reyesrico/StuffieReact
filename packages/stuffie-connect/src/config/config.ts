const config = {
  headers: {
    'cache-control': 'no-cache',
    'x-apikey': process.env.REACT_APP_RESTDB_API_KEY || ''
  },
  server: process.env.REACT_APP_RESTDB_SERVER_URL || 'https://stuffie-98b2.restdb.io/rest/'
};

export default config;
