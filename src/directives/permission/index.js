import router from "../../router";
import useAuthStore from "../../stores/auth.store";
import _ from 'lodash'

export const permission = {
    mounted(el, binding) {
        const authStore = useAuthStore()
        const { value } = binding
        const list = authStore.userInfo.menuList
        //按钮权限列表
        let permission = []
        list.forEach(item => {
            if (item.path.includes('.')) {
                permission.push(item.path)
            }
        });

        let current = _.camelCase(router.currentRoute.value.path.replace('/', ''))

        const url = `${current}.${value}`
        if (permission.includes(url) || authStore.userInfo.admin) {
            el.style.display = ''
        } else {
            el.style.display = 'none'
        }
    }
}