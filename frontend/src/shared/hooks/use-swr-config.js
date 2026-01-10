import axios from 'axios';

export const fetcher = (url) => axios.get(url).then((res) => res.data);

export const swrConfig = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
};
