import {Router} from 'express'
import { creatingnewtrip } from '../Controller/User.controller.js';
const rooter =Router();
rooter.route('/hello').get(creatingnewtrip);

export default rooter