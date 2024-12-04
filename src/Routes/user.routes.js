import {Router} from 'express'
import { LoginUser, RegisterUser } from '../Controller/User.controller.js';
import { authloginmw, authsignupmw } from '../Middleware/signup.middleware.js';
import { authtoken } from '../Middleware/authtoken.middleware.js';
import { Checkingauthorizaion } from '../Controller/Othercontroller.js';
const userrouter = Router();
console.log("aaya hu routes ");
userrouter.route('/Register').post(authsignupmw,RegisterUser);
userrouter.route('/Login').post(authloginmw,LoginUser);
userrouter.route('/checkforauthentication').post(authtoken,Checkingauthorizaion)
export default userrouter;
