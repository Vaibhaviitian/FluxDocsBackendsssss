import {Router} from 'express'
import { creatingcollabrequests, getUserRequests, handlerequest, sended_request} from '../Controller/Collabrequest.js';
import { all_docs } from '../Controller/User.controller.js';
const collabroutes = Router();
collabroutes.route('/sending_request').post(creatingcollabrequests);
collabroutes.route('/handling_request').post(handlerequest);
collabroutes.route('/my_requests').post(getUserRequests);
collabroutes.route('/sended_requests').post(sended_request);
collabroutes.route('/all_docs').get(all_docs);
export default collabroutes;
