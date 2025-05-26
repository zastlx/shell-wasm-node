import axios from "axios";
import { process } from "./src/index";

const { data } = await axios.get("https://shellshock.io/js/shellshock.js?" + Date.now());
process(data);