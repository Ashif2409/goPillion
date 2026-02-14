import axios from 'axios';
import https from 'https';

export const osmAxios = axios.create({
  httpsAgent: new https.Agent({
    family: 4 // force IPv4
  }),
  timeout: 10000,
  headers: {
    'User-Agent': 'GoPillion-Map-Service'
  }
});
