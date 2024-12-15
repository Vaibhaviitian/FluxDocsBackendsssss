import {Router} from 'express'
import { checking_loggedinuser, LoginUser, mydocs, RegisterUser, saving_title,anyuser } from '../Controller/User.controller.js';
import { authloginmw, authsignupmw } from '../Middleware/signup.middleware.js';
import { authtoken } from '../Middleware/authtoken.middleware.js';
import { userverified } from '../Controller/userverified.js';
const userrouter = Router();
console.log("aaya hu routes ");
userrouter.route('/Register').post(authsignupmw,RegisterUser);
userrouter.route('/Login').post(authloginmw,LoginUser);
userrouter.route('/checkforauthentication').post(authtoken,userverified);
userrouter.route('/saving-the-doc').post(saving_title);
userrouter.route('/checking-the-owner').post(checking_loggedinuser);
userrouter.route('/my_docs').post(mydocs);
userrouter.route('/anyuser').post(anyuser);
export default userrouter;
