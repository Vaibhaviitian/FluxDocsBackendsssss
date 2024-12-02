import {Router} from 'express'
import { other } from '../Controller/Othercontroller.js';
import { authtoken } from '../Middleware/authtoken.middleware.js';
const otherrouter = Router();
console.log("aaya hu routes");
otherrouter.route('/other').get(authtoken,other);
export default otherrouter;
