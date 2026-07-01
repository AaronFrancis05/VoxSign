import axios from "axios";

const TRANSCRIPTION_API_URL = process.env.TRANSCRIPTION_API_URL;

// @ts-ignore
const apiclient = axios.create({
  baseURL: TRANSCRIPTION_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiclient;
