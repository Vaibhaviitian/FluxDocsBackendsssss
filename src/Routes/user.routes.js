import {Router} from 'express'
import { LoginUser, RegisterUser } from '../Controller/User.controller.js';
import { authloginmw, authsignupmw } from '../Middleware/signup.middleware.js';
const userrouter = Router();
console.log("aaya hu routes ");
userrouter.route('/Register').post(authsignupmw,RegisterUser);
userrouter.route('/Login').post(authloginmw,LoginUser);
export default userrouter
