import {Router} from 'express'
import { Checkingauthorizaion } from '../Controller/Othercontroller.js';
import { authtoken } from '../Middleware/authtoken.middleware.js';
const otherrouter = Router();
console.log("aaya hu routes");
otherrouter.route('/otherz').post(authtoken,Checkingauthorizaion);
export default otherrouter;
