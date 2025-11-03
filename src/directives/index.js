import drag from './drag/index';
import scale from './scale/index';
import { permission } from './permission';

const install = function (app) {
  app.directive('drag', drag);
  app.directive('scale', scale);
  app.directive('permission', permission)
};

export default install;
