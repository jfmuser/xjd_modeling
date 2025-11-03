/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

export default {
  components: {
    ccheckbox: () => import('../Checkbox/index.vue'),
    cradio: () => import('../Radio/index.vue'),
    ceditor: () => import('../Editor/index.vue'),
    cinput: () => import('../Input/index.vue'),
    cselect: () => import('../Select/index.vue'),
    cstep: () => import('../Step/index.vue'),
    ctext: () => import('../Text/index.vue'),
    cselection: () => import('../Selection/index.vue'),
    ctitle: () => import('../Text/Title/index.vue'),
    csearch: () => import('../Searching/index.vue'),
    cbutton: () => import('../Button/index.vue'),
    clegend: () => import('../Legend/index.vue'),
  },
  exchangeTo(stats) {
    return 'c' + stats;
  },
};
